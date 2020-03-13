/**
 * External dependencies
 */
import * as React from 'react';
import { VerticalsTemplates } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import * as T from './types';
import { ValuesType } from 'utility-types';
import { Design, SiteVertical } from '../../stores/onboard/types';

const VT_STORE = VerticalsTemplates.register();

interface Props {
	viewport: T.Viewport;
	fonts: ValuesType< typeof import('./font-select').fontPairings >;
}
const Preview: React.FunctionComponent< Props > = ( { fonts, viewport } ) => {
	const { selectedDesign, siteVertical } = useSelect( select =>
		select( STORE_KEY ).getState()
	) as { selectedDesign: Design; siteVertical: SiteVertical };
	const template = useSelect( select =>
		select( VT_STORE ).getVerticalTemplate( siteVertical.id ?? '', selectedDesign.slug )
	);
	return (
		<div className="style-preview__preview">
			<p>Preview to be implemented.</p>
			<p>You picked { selectedDesign?.title ?? 'unknown' } design.</p>
			<p>Showing { viewport } display.</p>
			<p>With { fonts.join( ' / ' ) } display.</p>

			<pre>
				<code>{ template?.content }</code>
			</pre>
		</div>
	);
};

export default Preview;
