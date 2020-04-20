/**
 * External dependencies
 */
import * as React from 'react';
import { addQueryArgs } from '@wordpress/url';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import * as T from './types';
import { useLangRouteParam } from '../../path';
import { isEnabled } from 'config';

type Design = import('../../stores/onboard/types').Design;
type Font = import('../../constants').Font;
type SiteVertical = import('../../stores/onboard/types').SiteVertical;

interface Props {
	viewport: T.Viewport;
}
const Preview: React.FunctionComponent< Props > = ( { viewport } ) => {
	const [ previewHtml, setPreviewHtml ] = React.useState< string >();
	const [ requestedFonts, setRequestedFonts ] = React.useState< Set< Font > >( new Set() );

	const { selectedDesign, selectedFonts, siteVertical, siteTitle } = useSelect( ( select ) =>
		select( STORE_KEY ).getState()
	);

	const iframe = React.useRef< HTMLIFrameElement >( null );
	const language = useLangRouteParam();

	React.useEffect(
		() => {
			if ( ! selectedDesign ) {
				return;
			}
			const eff = async () => {
				const templateUrl = `https://public-api.wordpress.com/rest/v1/template/demo/${ encodeURIComponent(
					selectedDesign.theme
				) }/${ encodeURIComponent( selectedDesign.template ) }/`;
				let url = addQueryArgs( templateUrl, {
					language: language,
					site_title: siteTitle,
					...( selectedFonts && {
						font_headings: selectedFonts.headings,
						font_base: selectedFonts.base,
					} ),
				} );
				if ( isEnabled( 'gutenboarding/style-preview-verticals' ) ) {
					url = addQueryArgs( url, {
						vertical: siteVertical?.label,
					} );
				}
				let resp;

				try {
					resp = await window.fetch( url );
					if ( resp.status < 200 || resp.status >= 300 ) {
						throw resp;
					}
				} catch ( err ) {
					if ( process.env.NODE_ENV !== 'production' ) {
						// Disable reason: Log errors in development
						// eslint-disable-next-line no-console
						console.error( err );
					}
					setPreviewHtml( '<h1>Error loading preview.</h1>' );
					setRequestedFonts( new Set() );
					return;
				}
				const html = await resp.text();
				setPreviewHtml( html );
				setRequestedFonts(
					new Set( selectedFonts ? [ selectedFonts.headings, selectedFonts.base ] : undefined )
				);
			};
			eff();
		},
		// Disable reason: We'll handle font change elsewhere.
		[ language, selectedDesign, siteVertical ] // eslint-disable-line react-hooks/exhaustive-deps
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
			if ( selectedFonts ) {
				const { headings, base } = selectedFonts;

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

				if ( query.length ) {
					const l = iframeDocument.createElement( 'link' );
					l.rel = 'stylesheet';
					l.type = 'text/css';
					l.href = `${ baseURL }?${ query.join( '&' ) }&display=swap`;
					iframeDocument.head.appendChild( l );
					setRequestedFonts( nextFonts );
				}
				iframeDocument.body.style.setProperty( '--font-headings', headings );
				iframeDocument.body.style.setProperty( '--font-base', base );
			} else {
				iframeDocument.body.style.removeProperty( '--font-headings' );
				iframeDocument.body.style.removeProperty( '--font-base' );
			}
		}
	}, [ previewHtml, requestedFonts, selectedFonts ] );

	return (
		<div className={ `style-preview__preview is-viewport-${ viewport }` }>
			<div className="style-preview__preview-wrapper">
				{ viewport === 'desktop' && (
					<div role="presentation" className="style-preview__preview-bar">
						<div role="presentation" className="style-preview__preview-bar-dot" />
						<div role="presentation" className="style-preview__preview-bar-dot" />
						<div role="presentation" className="style-preview__preview-bar-dot" />
					</div>
				) }
				<iframe ref={ iframe } className="style-preview__iframe" title="preview" />
			</div>
		</div>
	);
};

export default Preview;
