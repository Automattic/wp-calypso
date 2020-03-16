/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import * as T from './types';
import { ValuesType } from 'utility-types';

interface Props {
	viewport: T.Viewport;
	fonts: ValuesType< typeof import('../../constants').fontPairings >;
}
const Preview: React.FunctionComponent< Props > = ( { fonts, viewport } ) => {
	const { selectedDesign } = useSelect( select => select( STORE_KEY ).getState() );
	return (
		<div className="style-preview__preview">
			<p>Preview to be implemented.</p>
			<p>You picked { selectedDesign?.title ?? 'unknown' } design.</p>
			<p>Showing { viewport } display.</p>
			<p>With { fonts.join( ' / ' ) } display.</p>
		</div>
	);
};

export default Preview;
