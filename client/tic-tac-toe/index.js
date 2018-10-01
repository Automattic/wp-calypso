/** @format */

/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import { ticTacToe } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/tic-tac-toe', ticTacToe, makeLayout, clientRender );
}
