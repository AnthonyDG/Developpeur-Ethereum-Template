const votingArtifacts = artifacts.require("Voting");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('Voting', accounts => {
    const adminOwner = accounts[0];
    const voter_01 = accounts[1];
    const voter_02 = accounts[2];
    const voter_03 = accounts[3];
    const voter_04 = accounts[4];
    const voter_05 = accounts[5];
    const voter_06 = accounts[6];
    const voter_07 = accounts[7];
    const voter_08 = accounts[8];
    const VoterHacker = accounts[9];

    let VotingInstance;
    let proposal_01 = "PROPOSAL_Blabla_1";
    let proposal_02 = "PROPOSAL_Blabla_2";
    let proposal_03 = "PROPOSAL_Blabla_3";

    describe("Tests : Getters, setters...", () => {
        beforeEach(async() => {
            VotingInstance = await votingArtifacts.new({from: adminOwner});
            // console.log("new VotingInstance !!!");

            await VotingInstance.addVoter(adminOwner, { from: adminOwner });
            await VotingInstance.addVoter(voter_01, { from: adminOwner });
        });


        it("the Admin/owner should have the first account", async () => {
            expect(adminOwner).to.equal(accounts[0]);
        });

        it("the Admin/owner should be the VotingInstance owner", async () => {
            const adminOwner_Address = await VotingInstance.owner(); // https://ethereum.stackexchange.com/a/82609
            // assert.equal(adminOwner_Address, adminOwner, 'has owner address');
            // expect(adminOwner_Address).to.equal('0x71E3736fc4f4E5C5ffDC54e8A7Bd39998872649E');
            expect(adminOwner_Address).to.equal(adminOwner);
        });


        context("Tests for REGISTRATION + getVoter()", () => {

            it("only Admin/owner should add a voter, revert", async () => {
                await expectRevert(VotingInstance.addVoter(voter_01, { from: voter_02 }), 'Ownable: caller is not the owner');
            });

            it("workflowStatus should be at the RegisteringVoters step", async () => {
                const Status = await VotingInstance.workflowStatus.call();
                // console.log("Status : ", Status);
                expect(new BN(Status)).to.be.bignumber.equal(new BN(0));
            });

            it("should add voters only when voters registration is open, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await expectRevert(VotingInstance.addVoter.call(voter_01, {from: adminOwner}), "Voters registration is not open yet");
            });


            it("should not add an already submitted address, revert", async () => {
                await expectRevert(VotingInstance.addVoter(voter_01, { from: adminOwner }), "Already registered");
            });

            it("should get event when a voter is added", async () => {
                const findEvent = await VotingInstance.addVoter(voter_02, {from: adminOwner});
                expectEvent(findEvent, 'VoterRegistered', { voterAddress: voter_02 }); // https://docs.openzeppelin.com/test-helpers/0.5/api#expect-event
            });
            
            context("Tests for getVoter()", () => {

                it("only Voters should get/view other voters, revert", async () => {
                    await VotingInstance.addVoter(voter_02, { from: adminOwner });
                    await expectRevert(VotingInstance.getVoter(voter_02, { from: VoterHacker }), "You're not a voter");
                });

                it("should add voter_02 + get .isRegistered", async () => {
                    await VotingInstance.addVoter(voter_02, { from: adminOwner });
                    const storedData = await VotingInstance.getVoter(voter_02);
                    // console.log("storedData : ", storedData);
                    expect(storedData.isRegistered).to.be.true;
                });

                it("should add voter_02 + get .hasVoted", async () => {
                    await VotingInstance.addVoter(voter_02, { from: adminOwner });
                    const storedData = await VotingInstance.getVoter(voter_02);
                    expect(storedData.hasVoted).to.be.false;
                });

                it("should add voter_02 + get .votedProposalId", async () => {
                    await VotingInstance.addVoter(voter_02, { from: adminOwner });
                    const storedData = await VotingInstance.getVoter(voter_02);
                    expect(new BN(storedData.votedProposalId)).to.be.bignumber.equal(new BN(0));
                });

                it("should add 7 voters (for a total of 9 voters) + get 1 .votedProposalId", async () => {
                    await VotingInstance.addVoter(voter_02, { from: adminOwner });
                    await VotingInstance.addVoter(voter_03, { from: adminOwner });
                    await VotingInstance.addVoter(voter_04, { from: adminOwner });
                    await VotingInstance.addVoter(voter_05, { from: adminOwner });
                    await VotingInstance.addVoter(voter_06, { from: adminOwner });
                    await VotingInstance.addVoter(voter_07, { from: adminOwner });
                    await VotingInstance.addVoter(voter_08, { from: adminOwner });

                    const storedData = await VotingInstance.getVoter(voter_07);
                    expect(new BN(storedData.votedProposalId)).to.be.bignumber.equal(new BN(0));
                });

            });
        });


        context("Tests : PROPOSAL + getOneProposal", () => {

            it("only voters should register proposals, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});

                await expectRevert(VotingInstance.addProposal("Proposal from Hacker", { from: VoterHacker }), "You're not a voter");
            });

            it("should add proposals only when proposals registering is open, revert", async () => {
                await expectRevert(VotingInstance.addProposal.call(proposal_01, { from: voter_01 }), "Proposals are not allowed yet");
            });


            it("should not register an empty proposal, revert", async () => {
                await VotingInstance.addVoter(voter_02, { from: adminOwner });
                await VotingInstance.startProposalsRegistering({from: adminOwner});

                await expectRevert(VotingInstance.addProposal("", { from: voter_01 }), "Vous ne pouvez pas ne rien proposer");
            });

            it("should register a proposal + get .description", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.addProposal(proposal_01, { from: voter_01 });

                const storedData = await VotingInstance.getOneProposal(0, {from: voter_01});
                expect(storedData.description).to.equal(proposal_01);
            });


            it("should get event when a proposal is registered", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});

                const findEvent = await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                expectEvent(findEvent, 'ProposalRegistered', { proposalId: new BN(0) }); // 0 = l'ID de la 1ère proposition déposée.
            });
            

            context("Tests for getOneProposal()", () => {
                it("only Voters should get/view proposals, revert", async () => {
                    await VotingInstance.startProposalsRegistering({from: adminOwner});

                    await expectRevert(VotingInstance.addProposal(proposal_01, { from: VoterHacker }), "You're not a voter");
                });

                it("should add proposal_01 + get .description", async () => {
                    await VotingInstance.startProposalsRegistering({from: adminOwner});
                    await VotingInstance.addProposal(proposal_01, { from: voter_01 });

                    const storedData = await VotingInstance.getOneProposal.call(0); // Proposal id = 0.
                    // console.log("storedData : ", storedData);
                    expect(storedData.description).to.equal(proposal_01);
                });

                it("should add proposal_01 + get .voteCount", async () => {
                    await VotingInstance.startProposalsRegistering({from: adminOwner});
                    await VotingInstance.addProposal(proposal_01, { from: voter_01 });

                    const storedData = await VotingInstance.getOneProposal.call(0); // Proposal id = 0.
                    expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(0)); // Nombre de votes = 0.
                });



                it("should add voters and 10 proposals + get 1 .description", async () => {
                    await VotingInstance.addVoter(voter_02, { from: adminOwner });
                    await VotingInstance.addVoter(voter_03, { from: adminOwner });
                    await VotingInstance.addVoter(voter_04, { from: adminOwner });
                    await VotingInstance.addVoter(voter_05, { from: adminOwner });
                    await VotingInstance.addVoter(voter_06, { from: adminOwner });
                    await VotingInstance.addVoter(voter_07, { from: adminOwner });
                    await VotingInstance.addVoter(voter_08, { from: adminOwner });

                    await VotingInstance.startProposalsRegistering({from: adminOwner});

                    await VotingInstance.addProposal(adminOwner, { from: adminOwner });
                    await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                    await VotingInstance.addProposal(proposal_01, { from: voter_02 });
                    await VotingInstance.addProposal(proposal_01, { from: voter_03 });
                    await VotingInstance.addProposal(proposal_01, { from: voter_04 });
                    await VotingInstance.addProposal(proposal_01, { from: voter_05 });
                    await VotingInstance.addProposal(proposal_01, { from: voter_06 });
                    await VotingInstance.addProposal(proposal_01, { from: voter_07 });
                    await VotingInstance.addProposal(proposal_01, { from: voter_08 });
                    await VotingInstance.addProposal(proposal_01, { from: voter_08 });
                    const storedData = await VotingInstance.getOneProposal.call(2); // Proposal id = 2.
                    // console.log("storedData : ", storedData);
                    expect(storedData.description).to.equal(proposal_01);
                });
            });
        });


        context("Tests : VOTE + getOneProposal", () => {

            it("only voters should vote, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});

                await expectRevert(VotingInstance.setVote(0, { from: VoterHacker }), "You're not a voter"); // Proposal id = 0.
            });

            it("should register votes only when voting session is open, revert", async () => {
                await expectRevert(VotingInstance.setVote.call(0, { from: voter_01 }), "Voting session havent started yet");
            });

            it("workflowStatus should be at the VotingSessionStarted step", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});

                const Status = await VotingInstance.workflowStatus.call();
                // console.log("Status : ", Status);
                expect(new BN(Status)).to.be.bignumber.equal(new BN(3));
            });

            it("should register vote by a non already voter, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});
                await VotingInstance.setVote(0, {from: voter_01});

                await expectRevert(VotingInstance.setVote(0, {from: voter_01}), "You have already voted");
            });

            it("should not vote for a non existing proposal, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.addProposal(proposal_01, { from: adminOwner });
                await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});

                await expectRevert.unspecified(VotingInstance.setVote(3, {from: voter_01}));
            });

            it("should register a vote + get", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.addProposal(proposal_01, { from: voter_01 });

                const storedData = await VotingInstance.getOneProposal(0, {from: voter_01});
                expect(storedData.description).to.equal(proposal_01);
            });

            it("should get event when a vote is registered, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.addProposal(proposal_01, { from: adminOwner });
                await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});

                const findEvent = await VotingInstance.setVote(1, {from: voter_01});
                expectEvent(findEvent, "Voted", { voter: voter_01, proposalId: new BN(1) }); // 1 = ID de la 2nde proposition déposée.
            });

            context("Tests for setVote()", () => {
                it("should add a vote + get .votedProposalId", async () => {
                    await VotingInstance.startProposalsRegistering({from: adminOwner});
                    await VotingInstance.addProposal(proposal_01, { from: adminOwner });
                    await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                    await VotingInstance.endProposalsRegistering({from: adminOwner});
                    await VotingInstance.startVotingSession({from: adminOwner});
                    await VotingInstance.setVote(1, {from: voter_01});

                    const storedData = await VotingInstance.getVoter(voter_01, {from: voter_01});
                    // console.log("storedData.votedProposalId : ", storedData.votedProposalId); // 1 = ID de la 2nde proposition déposée.
                    expect(new BN(storedData.votedProposalId)).to.be.bignumber.equal(new BN(1));
                });

                it("should add a vote + get .hasVoted", async () => {
                    await VotingInstance.startProposalsRegistering({from: adminOwner});
                    await VotingInstance.addProposal(proposal_01, { from: adminOwner });
                    await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                    await VotingInstance.endProposalsRegistering({from: adminOwner});
                    await VotingInstance.startVotingSession({from: adminOwner});
                    await VotingInstance.setVote(1, {from: voter_01});

                    const storedData = await VotingInstance.getVoter(voter_01, {from: voter_01});
                    // console.log("storedData.votedProposalId : ", storedData.votedProposalId); // 1 = ID de la 2nde proposition déposée.
                    expect(storedData.hasVoted).to.be.true;
                });

                it("should add a vote + get .voteCount", async () => {
                    await VotingInstance.startProposalsRegistering({from: adminOwner});
                    await VotingInstance.addProposal(proposal_01, { from: adminOwner });
                    await VotingInstance.addProposal(proposal_01, { from: voter_01 }); // ID = 1.
                    await VotingInstance.endProposalsRegistering({from: adminOwner});
                    await VotingInstance.startVotingSession({from: adminOwner});
                    await VotingInstance.setVote(1, {from: adminOwner}); // 1 = ID de la 2nde proposition déposée.
                    await VotingInstance.setVote(1, {from: voter_01});

                    const storedData = await VotingInstance.getOneProposal(1, {from: voter_01});
                    // console.log("storedData.voteCount : ", storedData.voteCount);
                    expect(new BN(storedData.voteCount)).to.be.bignumber.equal(new BN(2)); // 2 = nombre de votes pour la 2nde proposition.
                });
            });
        });
    });



    describe("Tests : STATE", () => {

        beforeEach(async() => {
            VotingInstance = await votingArtifacts.new({from: adminOwner});
            // console.log("new VotingInstance !!!");
            });

        context("Tests : startProposalsRegistering()", () => {
            it("only Admin/owner should start proposals registering, revert", async () => {
                await expectRevert(VotingInstance.startProposalsRegistering({from: voter_01}), "caller is not the owner");
            });

            it("should register proposal only when proposals registration is open, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await expectRevert(VotingInstance.startProposalsRegistering(), "Registering proposals cant be started now");
            });

            it("workflowStatus should be at the ProposalsRegistrationStarted step", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});

                const Status = await VotingInstance.workflowStatus.call();
                // console.log("Status : ", Status);
                expect(new BN(Status)).to.be.bignumber.equal(new BN(1));
            });

            it("should get event when proposals registering starts", async () => {
                const findEvent = await VotingInstance.startProposalsRegistering({from: adminOwner});
                expectEvent(findEvent, 'WorkflowStatusChange', { previousStatus: new BN(0), newStatus: new BN(1) });
            });
        });

        context("Tests : endProposalsRegistering()", () => {
            it("only Admin/owner should end proposals registering, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await expectRevert(VotingInstance.endProposalsRegistering({from: voter_01}), "caller is not the owner");
            });

            it("should end register proposal only when proposals registration is open, revert", async () => {
                await expectRevert(VotingInstance.endProposalsRegistering({from: adminOwner}), "Registering proposals havent started yet");
            });

            it("workflowStatus should be at the ProposalsRegistrationEnded step", async () => {
                await VotingInstance.addVoter(voter_01, { from: adminOwner });
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});

                const Status = await VotingInstance.workflowStatus.call();
                // console.log("Status : ", Status);
                expect(new BN(Status)).to.be.bignumber.equal(new BN(2));
            });

            it("should get event when proposals registering ends", async () => {
                await VotingInstance.addVoter(voter_01, { from: adminOwner });
                await VotingInstance.startProposalsRegistering({from: adminOwner});

                const findEvent = await VotingInstance.endProposalsRegistering({from: adminOwner});
                expectEvent(findEvent, 'WorkflowStatusChange', { previousStatus: new BN(1), newStatus: new BN(2) });
            });
        });

        context("Tests : startVotingSession()", () => {
            it("only Admin/owner should start voting session, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});

                await expectRevert(VotingInstance.startVotingSession({from: voter_01}), "caller is not the owner");
            });

            it("should start voting session only when proposals registration is ended (= last step), revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});

                await expectRevert(VotingInstance.startVotingSession({from: adminOwner}), "Registering proposals phase is not finished");
            });

            it("workflowStatus should be at the VotingSessionStarted step", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});

                const Status = await VotingInstance.workflowStatus.call();
                // console.log("Status : ", Status);
                expect(new BN(Status)).to.be.bignumber.equal(new BN(3));
            });

            it("should get event when starts voting session", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});

                const findEvent = await VotingInstance.startVotingSession({from: adminOwner});
                expectEvent(findEvent, 'WorkflowStatusChange', { previousStatus: new BN(2), newStatus: new BN(3) });
            });
        });

        context("Tests : endVotingSession()", () => {
            it("only Admin/owner should start voting session, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});
                await expectRevert(VotingInstance.endVotingSession({from: voter_01}), "caller is not the owner");
            });

            it("should end voting session only when voting session is started (= last step), revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await expectRevert(VotingInstance.endVotingSession({from: adminOwner}), "Voting session havent started yet");
            });



            it("workflowStatus should be at the VotingSessionEnded step", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});
                await VotingInstance.endVotingSession({from: adminOwner});

                const Status = await VotingInstance.workflowStatus.call();
                // console.log("Status : ", Status);
                expect(new BN(Status)).to.be.bignumber.equal(new BN(4));
            });

            it("should get event when ends voting session", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});

                const findEvent = await VotingInstance.endVotingSession({from: adminOwner});
                expectEvent(findEvent, 'WorkflowStatusChange', { previousStatus: new BN(3), newStatus: new BN(4) });
            });
        });

        context("Tests : tallyVotes()", () => {
            it("only Admin/owner should tally votes, revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});
                await VotingInstance.endVotingSession({from: adminOwner});
                await expectRevert(VotingInstance.tallyVotes({from: voter_01}), "caller is not the owner");
            });

            it("should end voting session only when voting session is started (= last step), revert", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});
                await expectRevert(VotingInstance.tallyVotes({from: adminOwner}), "Current status is not voting session ended");
            });

            it("should tally votes", async () => {
                await VotingInstance.addVoter(voter_01, { from: adminOwner });
                await VotingInstance.addVoter(voter_02, { from: adminOwner });
                await VotingInstance.addVoter(voter_03, { from: adminOwner });
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.addProposal(proposal_01, { from: voter_01 });
                await VotingInstance.addProposal(proposal_02, { from: voter_02 });
                await VotingInstance.addProposal(proposal_03, { from: voter_03 });
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});
                await VotingInstance.setVote(1, {from: voter_01});
                await VotingInstance.setVote(2, {from: voter_02});
                await VotingInstance.setVote(1, {from: voter_03});
                await VotingInstance.endVotingSession({from: adminOwner});
                await VotingInstance.tallyVotes({from: adminOwner});

                expect(BN(await VotingInstance.winningProposalID.call())).to.be.bignumber.equal(BN(1)); // id 1 proposal must be the winner.
            });

            it("workflowStatus should be at the VotesTallied step", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});
                await VotingInstance.endVotingSession({from: adminOwner});
                await VotingInstance.tallyVotes({from: adminOwner});

                const Status = await VotingInstance.workflowStatus.call();
                // console.log("Status : ", Status);
                expect(new BN(Status)).to.be.bignumber.equal(new BN(5));
            });

            it("should get event when ends votes tallied", async () => {
                await VotingInstance.startProposalsRegistering({from: adminOwner});
                await VotingInstance.endProposalsRegistering({from: adminOwner});
                await VotingInstance.startVotingSession({from: adminOwner});
                await VotingInstance.endVotingSession({from: adminOwner});

                const findEvent = await VotingInstance.tallyVotes({from: adminOwner});
                expectEvent(findEvent, 'WorkflowStatusChange', { previousStatus: new BN(4), newStatus: new BN(5) });
            });
        });
    });
});
