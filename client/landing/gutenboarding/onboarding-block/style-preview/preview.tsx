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
	const [ requestedFonts, setRequestedFonts ] = React.useState< Set< string > >( new Set() );

	// Disabled while previews are implemented
	// Cast: These are required to be on this step.
	// const { selectedDesign, siteVertical } = useSelect( select =>
	// 	select( STORE_KEY ).getState()
	// ) as { selectedDesign: Design; siteVertical: SiteVertical };

	const iframe = React.useRef< HTMLIFrameElement >( null );

	React.useEffect(
		() => {
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
		},
		// Disable reason: We'll handle font change elsewhere.
		[] // eslint-disable-line react-hooks/exhaustive-deps
	);

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

	React.useEffect( () => {
		const iframeWindow = iframe.current?.contentWindow;
		if ( iframeWindow?.document.body ) {
			const iframeDocument = iframeWindow.document;
			const [ { fontFamily: headings }, { fontFamily: base } ] = fonts;

			const baseURL = 'https://fonts.googleapis.com/css2';

			// matrix: regular,bold * regular,italic
			const axis = 'ital,wght@0,400;0,700;1,400;1,700';
			const query = [];

			// To replace state
			const nextFonts = new Set( requestedFonts );

			if ( ! requestedFonts.has( headings ) ) {
				query.push( `family=${ encodeURI( headings ) }:${ axis }` );
				nextFonts.add( headings );
			}
			if ( ! requestedFonts.has( base ) ) {
				query.push( `family=${ encodeURI( base ) }:${ axis }` );
				nextFonts.add( base );
			}

			console.log( 'requested %o', requestedFonts );
			if ( query.length ) {
				console.log( 'adding %o', query );
				const l = iframeDocument.createElement( 'link' );
				l.rel = 'stylesheet';
				l.type = 'text/css';
				l.href = `${ baseURL }?${ query.join( '&' ) }&display=swap`;
				iframeDocument.head.appendChild( l );
				setRequestedFonts( nextFonts );
			}
			iframeDocument.body.style.setProperty( '--font-headings', `${ headings }` );
			iframeDocument.body.style.setProperty( '--font-base', `${ headings }` );
		}
	}, [ fonts, previewHtml, requestedFonts ] );

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
