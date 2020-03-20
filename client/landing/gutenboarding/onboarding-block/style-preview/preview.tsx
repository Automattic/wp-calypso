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
		<div className={ `style-preview__preview is-viewport-${ viewport }` }>
			{ viewport === 'desktop' && (
				<div role="presentation" className="style-preview__preview-bar">
					<div role="presentation" className="style-preview__preview-bar-dot" />
					<div role="presentation" className="style-preview__preview-bar-dot" />
					<div role="presentation" className="style-preview__preview-bar-dot" />
				</div>
			) }
			<div style={ { width: '100%', height: '100%', background: 'var(--studio-gray-5)' } }>
				<p>Preview to be implemented.</p>
				<p>You picked { selectedDesign?.title ?? 'unknown' } design.</p>
				<p>
					Showing { viewport } display with { fontA }&nbsp;/&nbsp;{ fontB } fonts.
				</p>
			</div>
		</div>
	);
};

export default Preview;
