/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Game from './game';

export function ticTacToe( context, next ) {
	context.primary = <Game />;
	next();
}
