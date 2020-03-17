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
	const [ { title: fontA }, { title: fontB } ] = fonts;
	return (
		<div className="style-preview__preview">
			<div role="presentation" className="style-preview__preview-bar">
				<div role="presentation" className="style-preview__preview-bar-dot" />
				<div role="presentation" className="style-preview__preview-bar-dot" />
				<div role="presentation" className="style-preview__preview-bar-dot" />
			</div>
			<p>Preview to be implemented.</p>
			<p>You picked { selectedDesign?.title ?? 'unknown' } design.</p>
			<p>Showing { viewport } display.</p>
			<p>
				With { fontA }&nbsp;/&nbsp;{ fontB } display.
			</p>
		</div>
	);
};

export default Preview;
