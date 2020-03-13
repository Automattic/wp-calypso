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
	fonts: ValuesType< typeof import('./font-select').fontPairings >;
}
const Preview: React.FunctionComponent< Props > = ( { viewport } ) => {
	const { selectedDesign } = useSelect( select => select( STORE_KEY ).getState() );
	return (
		<div className="style-preview__preview">
			Preview to be implemented. You picked { selectedDesign?.title ?? 'unknown' } design. Showing{ ' ' }
			{ viewport } display.
		</div>
	);
};

export default Preview;
