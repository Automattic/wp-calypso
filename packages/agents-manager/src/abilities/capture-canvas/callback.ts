import { __, _n, sprintf } from '@wordpress/i18n';
import { resolveClientId } from '../../utils/block-ids';
import { captureCanvas } from '../../utils/canvas-capture';
import { getBlock } from '../../utils/editor-blocks';
import { isRecord } from '../../utils/is-record';
import { errorResult, successResult } from '../ability-result';
import type { AbilityResult } from '../types';

const isString = ( value: unknown ): value is string => typeof value === 'string';

/**
 * A picture of the canvas as it renders now, framed on the named blocks. No
 * picture is a failure on purpose: "done" without one would invite the agent
 * to carry on as though it had seen the page.
 */
export async function captureCanvasCallback( rawInput: unknown ): Promise< AbilityResult > {
	const input = isRecord( rawInput ) ? rawInput : {};
	// Only blocks on the canvas can be framed, so the reply describes what was.
	const clientIds = ( Array.isArray( input.clientIds ) ? input.clientIds : [] )
		.filter( isString )
		.map( resolveClientId )
		.filter( ( clientId ) => getBlock( clientId ) );
	const fullPage = input.fullPage === true;

	const fileParts = await captureCanvas( { clientIds, fullPage } );

	if ( ! fileParts?.length ) {
		return errorResult(
			'Canvas capture produced no image. The editor canvas may not be open, or the capture was refused because it could not be made faithful. Do not assume anything about how the page looks; read the block structure instead.',
			__( "I couldn't get a picture of the canvas just now.", __i18n_text_domain__ )
		);
	}

	// What the capture did, not what was asked: an edit reaching past a
	// screenful gets the whole page whether or not it was requested.
	let message: string;

	if ( fileParts[ 0 ].metadata?.fullPage ) {
		message = __(
			'Here is the whole page, top to bottom. It is scaled down to fit, so body text will not be legible — read it for colour, type scale, spacing and section rhythm, and take an ordinary picture of a specific area when wording or fine detail matters. Photographs are shown as flat placeholder boxes at their real size.',
			__i18n_text_domain__
		);
	} else if ( clientIds.length ) {
		message = sprintf(
			/* translators: %d: number of blocks framed in the screenshot. */
			_n(
				'Here is the canvas around %d block. Photographs are shown as flat placeholder boxes at their real size, so treat any grey rectangle as an image that is present, not as a missing one.',
				'Here is the canvas around %d blocks. Photographs are shown as flat placeholder boxes at their real size, so treat any grey rectangle as an image that is present, not as a missing one.',
				clientIds.length,
				__i18n_text_domain__
			),
			clientIds.length
		);
	} else {
		message = __(
			'Here is the visible area of the canvas. Photographs are shown as flat placeholder boxes at their real size, so treat any grey rectangle as an image that is present, not as a missing one.',
			__i18n_text_domain__
		);
	}

	return { ...successResult( message ), __file_parts: fileParts };
}
