import React, { useContext, useEffect, useState } from 'react';
import './Board.scss';
import { withRouter } from 'react-router-dom';
import { initialSetUp, setFigures, rankElements, promotionModal, handleCastling, handlePawnPromotion } from './boardHelper';
import { GameContext } from '../../context/GameContext';
import { socket } from '../../../helpers/Socket';

function Board({ playingAsBlack, playable = true, location, autoRotate, setMsg }) {
    const [gameBoard, setGameBoard] = useState(initialSetUp());
    const [blackFigures, setBlackFigures] = useState(setFigures('black'));
    const [whiteFigures, setWhiteFigures] = useState(setFigures('white'));
    const [selectedFigure, setSelectedFigure] = useState(null);
    const [availableMoves, setAvailableMoves] = useState (null);

    const [currentTurn, setCurrentTurn] = useState('white');
    const [checkedPlayer, setCheckedPlayer] = useState(null);
    const [promoModalState, setPromoModalState] = useState(null);

    const [playerIsBlack, setPlayerIsBlack] = useState(playingAsBlack);
    const [isLocal] = useState(location.pathname === '/local');
    const { roomId, setMovesHistory } = useContext(GameContext);
    const [receivedMove, setReceivedMove] = useState(null);

    const probabilities = {
        pawn:{
            queen: 0.5,
            rook: 0.75,
            knight: 0.76,
            bishop: 0.75,
            pawn: 0.5,
            king: 1
        },
        knight:{
            queen: 0.6,
            rook: 0.7,
            knight: 0.8,
            bishop: 0.8,
            pawn: 0.85,
            king: 1
        },
        bishop:{
            queen: 0.6,
            rook: 0.7,
            knight: 0.8,
            bishop: 0.8,
            pawn: 0.85,
            king: 1
        },
        rook:{
            queen: 0.7,
            rook: 0.8,
            knight: 0.8,
            bishop: 0.8,
            pawn: 0.85,
            king: 1
        },
        queen:{
            queen: 0.8,
            rook: 0.85,
            knight: 0.9,
            bishop: 0.9,
            pawn: 0.95,
            king: 1
        },
        king:{
            queen: 1,
            rook: 1,
            knight: 1,
            bishop: 1,
            pawn: 1,
            king: 1
        }
    }

    useEffect(()=> {
        socket.on('move', ({ figIndex, nextSquareIndex }) => {
            const figToMove = gameBoard[figIndex].occupiedBy;
            const enemyFigures = currentTurn === 'black' ? blackFigures : whiteFigures;
            setSelectedFigure(figToMove);
            setAvailableMoves(figToMove.getFigureLegalMoves(gameBoard, enemyFigures));
            setReceivedMove(gameBoard[nextSquareIndex]);
        })
    }, []);

    useEffect(()=> {
        if (!receivedMove) return;
        moveFigure(receivedMove);
        setCurrentTurn(currentTurn === 'black' ? 'white' : 'black');
        setReceivedMove(null);
    }, [receivedMove]);

    // Rotate the board when props get updated
    useEffect(() => setPlayerIsBlack(playingAsBlack), [playingAsBlack]);

    useEffect(() => {
        if (!checkedPlayer) return;

        let hasLegalMoves = false;
        const figures = currentTurn === 'black' ? blackFigures : whiteFigures;
        const enemyFigures = currentTurn === 'black' ? whiteFigures : blackFigures;

        for (const fig of figures) {
            if (fig.getFigureLegalMoves(gameBoard, enemyFigures).length) {
                hasLegalMoves = true;
                break;
            }
        };

        if (!hasLegalMoves) console.log('GG');
        else setCheckedPlayer(false);
    }, [currentTurn]);

    function selectFigure(square) {
        const isMyTurn = isLocal || (playingAsBlack && currentTurn === 'black') || (!playingAsBlack && currentTurn === 'white');
        if (square.occupiedBy?.color !== currentTurn || !isMyTurn) return;

        const enemyFigures = currentTurn === 'black' ? whiteFigures : blackFigures;
        const legalMoves = square.occupiedBy.getFigureLegalMoves(gameBoard, enemyFigures);
        toggleSelectedStyles(square.occupiedBy, legalMoves);
        setSelectedFigure(square.occupiedBy);
        setAvailableMoves(legalMoves);
    }

    async function moveFigure(square) {
        if (!receivedMove) toggleSelectedStyles(selectedFigure, availableMoves);

        if (square.position !== selectedFigure.position && square.occupiedBy?.color === currentTurn) {
            selectFigure(square);
            return;
        }

        if (square.position === selectedFigure.position || !availableMoves.includes(square.position)) {
            setSelectedFigure(null);
            setAvailableMoves(null);
            return;
        }

        document.querySelector('.checked')?.classList.remove('checked');
        const gameBoardCopy = [...gameBoard];
        let flag = null

        if (square.occupiedBy) {
            let rand = Math.random()
            if(probabilities[selectedFigure.type][square.occupiedBy.type] > rand){
                flag = true
                takeFigure(square.occupiedBy, flag)
                setMsg('SUCCESS')
            } else {
                flag = false
                takeFigure(selectedFigure, flag)
                setMsg('FAILURE')
            }
        }
        if (selectedFigure.type === 'king' && !selectedFigure.lastPosition) handleCastling(gameBoardCopy, square.position, currentTurn);

        gameBoardCopy[selectedFigure.position -1].occupiedBy = null;
        if(!(!flag&&square.occupiedBy)){
            selectedFigure.lastPosition = selectedFigure.position;
            selectedFigure.position = square.position;
            gameBoardCopy[square.position -1].occupiedBy = selectedFigure;
        }

        if (selectedFigure.canPromote()) await handlePawnPromotion(selectedFigure, currentTurn, setPromoModalState);
        if (selectedFigure.seeIfCheck(gameBoardCopy)) setCheckedPlayer(true);

        updateMovesHistory(square.name, selectedFigure.type);
        setSelectedFigure(null);
        setAvailableMoves(null);
        setGameBoard(gameBoardCopy);

        if (!receivedMove) switchTurn(selectedFigure.lastPosition - 1, square.position - 1);
    }

    function updateMovesHistory(squareName, figureType) {
        setMovesHistory(currentMoves => {
            const move = { squareName, figureType, player: currentTurn }
            return [...currentMoves, move];
        });
    }

    function takeFigure(figureToRemove, flag) {
        const enemyFigures = figureToRemove.color === 'white' ? setWhiteFigures : setBlackFigures;
        enemyFigures(figures => figures.filter(fig => fig !== figureToRemove));
        console.log(whiteFigures)
        console.log(blackFigures)
    }

    function toggleSelectedStyles(figure, positions) {
        const toggleClass = (className, id) => document.getElementById(id).classList.toggle(className);
        toggleClass('selected', figure.position);
        positions.forEach(position => {
            toggleClass(`potential-move${ gameBoard[position -1].occupiedBy ? '-take' : '' }`, position);
        });
    }

    function switchTurn(figIndex, nextSquareIndex) {
        setCurrentTurn(currentTurn === 'white' ? 'black' : 'white');
        if (autoRotate) setPlayerIsBlack(!playerIsBlack);
        if (!isLocal) socket.emit('move', { figIndex, nextSquareIndex, roomId });
    }

    return (
        <div className='Board'>
            <div className='wrapper' style={{ transform: playerIsBlack ? 'rotate(180deg)' : null }}>
                { gameBoard.map(square => (
                    <div className='square'
                        style={{ backgroundColor: square.color }}
                        id={ square.position }
                        key={ square.position }
                        onClick={ () => {
                            if (!playable) return;
                            selectedFigure ? moveFigure(square) : selectFigure(square) }
                        }>
                        {
                            square.occupiedBy ?
                            <img
                                src={ square?.occupiedBy?.img?.src }
                                alt={ square?.occupiedBy?.img?.alt }
                                style={{ transform: playerIsBlack ? 'rotate(180deg)' : null }}>
                            </img> : null
                        }
                    </div>))
                }
            </div>
            <div className='row-ranks'>{ rankElements(playerIsBlack).rowRanks }</div>
            <div className='col-ranks'>{ rankElements(playerIsBlack).colRanks }</div>
            { promoModalState ? promotionModal( promoModalState) : ''}
        </div>
    )
}

export default withRouter(Board);
