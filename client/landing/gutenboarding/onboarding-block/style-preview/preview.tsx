/**
 * External dependencies
 */
import * as React from 'react';
import { addQueryArgs } from '@wordpress/url';
import { useSelect } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import type { Viewport } from './types';
import { useFontPairings } from '../../fonts';
import type { FontPair } from '../../constants';

function getFontsLoadingHTML( effectiveFontPairings: readonly FontPair[] ) {
	const baseURL = 'https://fonts.googleapis.com/css2';

	// matrix: regular,bold * regular,italic
	const axis = 'ital,wght@0,400;0,700;1,400;1,700';

	// create a query for all fonts together
	const query = effectiveFontPairings.reduce( ( acc, pairing ) => {
		acc.push(
			`family=${ encodeURI( pairing.headings ) }:${ axis }`,
			`family=${ encodeURI( pairing.base ) }:${ axis }`
		);
		return acc;
	}, [] as string[] );

	const l = document.createElement( 'link' );
	l.rel = 'stylesheet';
	l.type = 'text/css';
	l.href = `${ baseURL }?${ query.join( '&' ) }&display=swap`;
	const head = l.outerHTML;

	// Chrome doesn't load the fonts in memory until they're actually used,
	// this keeps the fonts used and ready in memory.
	const fontsHolders = ( effectiveFontPairings as FontPair[] ).reduce( ( acc, pairing ) => {
		Object.values( pairing ).forEach( ( font ) => {
			const fontHolder = document.createElement( 'div' );
			fontHolder.style.fontFamily = font;
			fontHolder.innerHTML = 'Placeholder';
			fontHolder.style.visibility = 'hidden';
			fontHolder.style.position = 'absolute';
			acc += fontHolder.outerHTML;
		} );
		return acc;
	}, '' );

	return { head, fontsHolders };
}

interface Props {
	viewport: Viewport;
}
const Preview: React.FunctionComponent< Props > = ( { viewport } ) => {
	const language = useLocale();
	const [ previewHtml, setPreviewHtml ] = React.useState< string >();
	const { selectedDesign, selectedFonts, siteTitle } = useSelect( ( select ) => ( {
		selectedDesign: select( STORE_KEY ).getSelectedDesign(),
		selectedFonts: select( STORE_KEY ).getSelectedFonts(),
		siteTitle: select( STORE_KEY ).getSelectedSiteTitle(),
	} ) );

	const iframe = React.useRef< HTMLIFrameElement >( null );
	const effectiveFontPairings = useFontPairings();

	React.useEffect(
		() => {
			if ( ! selectedDesign ) {
				return;
			}
			const eff = async () => {
				const templateUrl = `https://public-api.wordpress.com/rest/v1/template/demo/${ encodeURIComponent(
					selectedDesign.theme
				) }/${ encodeURIComponent( selectedDesign.template ) }/`;
				const url = addQueryArgs( templateUrl, {
					language,
					site_title: siteTitle,
					...( selectedFonts && {
						font_headings: selectedFonts.headings,
						font_base: selectedFonts.base,
					} ),
				} );

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
					return;
				}
				const html = await resp.text();
				const { head, fontsHolders } = getFontsLoadingHTML( effectiveFontPairings );
				// the browser automatically moves the head code to the <head />
				setPreviewHtml( head + html + fontsHolders );
			};
			eff();
		},
		// Disable reason: We'll handle font change elsewhere.
		[ language, selectedDesign ] // eslint-disable-line react-hooks/exhaustive-deps
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
				iframeDocument.documentElement.style.setProperty( '--font-headings', headings );
				iframeDocument.documentElement.style.setProperty( '--font-base', base );
			} else {
				iframeDocument.documentElement.style.removeProperty( '--font-headings' );
				iframeDocument.documentElement.style.removeProperty( '--font-base' );
			}
		}
	}, [ previewHtml, selectedFonts ] );

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
				<iframe
					className="style-preview__iframe"
					data-hj-allow-iframe
					ref={ iframe }
					title="preview"
				/>
			</div>
		</div>
	);
};

export default Preview;
