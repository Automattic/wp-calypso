import { __ } from '@wordpress/i18n';
import { resolveClientId } from '../../utils/block-ids';
import { captureCanvas, describeCaptureShape } from '../../utils/canvas-capture';
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
	const clientIds = ( Array.isArray( input.clientIds ) ? input.clientIds : [] )
		.filter( isString )
		.map( resolveClientId );
	const fullPage = input.fullPage === true;

	const fileParts = await captureCanvas( { clientIds, fullPage } );

	if ( ! fileParts?.length ) {
		return errorResult(
			'Canvas capture produced no image. The editor canvas may not be open, or the capture was refused because it could not be made faithful. Do not assume anything about how the page looks; read the block structure instead.',
			__( "I couldn't get a picture of the canvas just now.", __i18n_text_domain__ )
		);
	}

	// What the capture did, not what was asked: blocks far apart get a picture
	// each, blocks spread wider than bands can cover get the whole page, and a
	// block with no box on the canvas framed nothing. Summed across the
	// pictures, since each band counts only the blocks it holds.
	const coveredPage = fileParts[ 0 ].metadata?.fullPage;
	const framed = fileParts.reduce( ( total, part ) => {
		const count = part.metadata?.framed;

		return total + ( typeof count === 'number' ? count : 0 );
	}, 0 );

	let described: string;

	if ( coveredPage ) {
		described =
			'Here is the whole page, top to bottom. It is scaled down to fit, so body text will not be legible — read it for colour, type scale, spacing and section rhythm, and take an ordinary picture of a specific area when wording or fine detail matters. Photographs are shown as flat placeholder boxes at their real size.';
	} else if ( framed > 0 ) {
		described = `Here is the canvas around ${ framed } ${
			framed === 1 ? 'block' : 'blocks'
		}. Photographs are shown as flat placeholder boxes at their real size, so treat any grey rectangle as an image that is present, not as a missing one.`;
	} else {
		described =
			'Here is the visible area of the canvas. Photographs are shown as flat placeholder boxes at their real size, so treat any grey rectangle as an image that is present, not as a missing one.';
	}

	// Only the band count needs adding here: the whole-page branch already says
	// it is scaled down, which is the other thing the shape reports.
	const message = [ described, coveredPage ? '' : describeCaptureShape( fileParts ) ]
		.filter( Boolean )
		.join( ' ' );

	return { ...successResult( message ), __file_parts: fileParts };
}
