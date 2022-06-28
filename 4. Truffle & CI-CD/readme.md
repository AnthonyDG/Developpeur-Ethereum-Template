# TP n°2 : Tests unitaires

## _Préambule_

J'ai choisi de tester le fichier voting.sol entier car je souhaitais connaître le résultat avec l'outils "Solidity-Coverage" et également pour avoir votre correction de développeurs professionnels.

## Introduction

Les tests unitaires de ce TP portent sur le fichier voting.sol tel que je l'ai téléchargé sur le Google drive d'Alyra.
Les tests sont dans quasimment le même ordre que celui du fichier du développeur de "voting.sol".

Ces fonctions ont été testés :
**Contract: Voting**
&emsp; - 28 Tests : Getters, setters...
&emsp;&emsp;dont 9 Tests pour REGISTRATION + getVoter()
&emsp;&emsp;&emsp;dont 5 Tests pour getVoter()
&emsp;&emsp;dont 8 Tests : PROPOSAL + getOneProposal
&emsp;&emsp;&emsp;dont 4 Tests pour getOneProposal()
&emsp;&emsp;dont 9 Tests : VOTE + getOneProposal
&emsp;&emsp;&emsp;dont 3 Tests pour setVote()
&emsp; - 21 Tests : STATE
&emsp;&emsp;dont 4 Tests sur startProposalsRegistering()
&emsp;&emsp;dont 4 Tests sur endProposalsRegistering()
&emsp;&emsp;dont 4 Tests sur startVotingSession()
&emsp;&emsp;dont 4 test sur endVotingSession()
&emsp;&emsp;dont 5 Tests sur tallyVotes()

D'autres tests ont aussi été réalisés avec les outils **"eth-gas-reporter"** et **"solidity-coverage"**.
Les 2 images ci-dessous montrent les résultats.

## Test Coverage

![Test Coverage](all-coverage.png)

## Test eth-gas-reporter

![Tests unitaires avec eth-gas-reporter activé](all-eth-gas.png)
