/**
 * External dependencies
 */
import * as React from 'react';
// import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
// import { STORE_KEY } from '../../stores/onboard';
import * as T from './types';
import { ValuesType } from 'utility-types';
// import { Design, SiteVertical } from '../../stores/onboard/types';

/* eslint-disable no-console */

interface Props {
	viewport: T.Viewport;
	fonts: ValuesType< typeof import('../../constants').fontPairings >;
}
const Preview: React.FunctionComponent< Props > = ( { fonts, viewport } ) => {
	const [ previewHtml, setPreviewHtml ] = React.useState< string >();
	const iframe = React.useRef< HTMLIFrameElement >( null );

	React.useEffect( () => {
		const eff = async () => {
			const [ { fontFamily: headings }, { fontFamily: base } ] = fonts;
			const url = `https://public-api.wordpress.com/rest/v1/template-demo/${ encodeURIComponent(
				'rockfield'
			) }/${ encodeURIComponent( 'rockfield' ) }/en/${ encodeURIComponent(
				'gym'
			) }?font_headings=${ encodeURI( headings ) }&font_base=${ encodeURI( base ) }`;
			const resp = await window.fetch( url );
			const html = await resp.text();
			setPreviewHtml( html );
		};
		eff();
	}, [ fonts ] );

	React.useEffect( () => {
		if ( previewHtml ) {
			const iframeDocument = iframe.current?.contentWindow?.document;
			if ( iframeDocument ) {
				iframeDocument.open();
				iframeDocument.write( previewHtml );
				iframeDocument.close();
			}
		}
	}, [ previewHtml ] );

	return (
		<div className={ `style-preview__preview is-viewport-${ viewport }` }>
			{ viewport === 'desktop' && (
				<div role="presentation" className="style-preview__preview-bar">
					<div role="presentation" className="style-preview__preview-bar-dot" />
					<div role="presentation" className="style-preview__preview-bar-dot" />
					<div role="presentation" className="style-preview__preview-bar-dot" />
				</div>
			) }
			<iframe ref={ iframe } className="style-preview__iframe" title="preview" />
		</div>
	);
};

export default Preview;
