/**
 * External dependencies
 */
import * as React from 'react';
import { addQueryArgs } from '@wordpress/url';
import { useSelect } from '@wordpress/data';
import classNames from 'classnames';
import { animated, Spring } from 'react-spring/renderprops';
import { colors } from '@automattic/color-studio';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import * as T from './types';
import { useLangRouteParam } from '../../path';

/**
 * Calypso dependencies
 */
import { useWindowResizeRect } from '../../../../lib/track-element-size';

type Font = import('../../constants').Font;

// For height calculations.
// The box shadow makes the page overflow so prevent the iframe from reaching the bottom by including extra space.
const BOTTOM_EXTRA = 20;

const RATIO_MOBILE = 351 / 690;
const RATIO_TABLET = 1024 / 768;

const BASE_STYLE_DESKTOP: React.CSSProperties = {
	borderTopWidth: 30,
	borderRightWidth: 0,
	borderBottomWidth: 0,
	borderLeftWidth: 0,
	borderRadius: 4,
};
const BASE_STYLE_DEVICE: React.CSSProperties = {
	borderTopWidth: 13,
	borderRightWidth: 13,
	borderBottomWidth: 13,
	borderLeftWidth: 13,
	borderRadius: 31,
};

interface Props {
	viewport: T.Viewport;
}
const Preview: React.FunctionComponent< Props > = ( { viewport } ) => {
	const [ containerStyle, setContainerStyle ] = React.useState< React.CSSProperties >( {} );
	const [ containerRef, containerRect ] = useWindowResizeRect< HTMLDivElement >();

	React.useEffect( () => {
		console.log( 'El %o, Rect %o', containerRef.current, containerRect );
		if ( ! containerRect ) {
			return;
		}
		// Calculate the width / height of our area and apply a ratio to fit within area.

		const maxWidth = containerRect.width;
		const maxHeight =
			window.document.documentElement.clientHeight - containerRect.top - BOTTOM_EXTRA;

		const areaRatio = maxWidth / maxHeight;

		console.log( 'maxW: %o // maxH: %o', maxWidth, maxHeight );

		switch ( viewport ) {
			case 'desktop':
				console.log( 'Setting %o', { height: maxHeight, width: maxWidth } );
				setContainerStyle( { height: maxHeight, width: '100%' } );
				break;

			case 'mobile':
				setContainerStyle( { height: 691, width: '350px' } );
				break;

			case 'tablet':
				setContainerStyle( { height: 768, width: '1024px' } );
				break;
		}
	}, [ containerRef, containerRect, viewport ] );

	const [ previewHtml, setPreviewHtml ] = React.useState< string >();
	const [ requestedFonts, setRequestedFonts ] = React.useState< Set< Font > >( new Set() );

	const { selectedDesign, selectedFonts, siteVertical, siteTitle } = useSelect( select =>
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
				const url = addQueryArgs( templateUrl, {
					language: language,
					vertical: siteVertical?.label,
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

	const baseStyle = viewport === 'desktop' ? BASE_STYLE_DESKTOP : BASE_STYLE_DEVICE;

	return (
		<div ref={ containerRef } className={ `style-preview__preview is-viewport-${ viewport }` }>
			<Spring from={ { borderWidth: 0, height: 700 } } to={ { ...baseStyle, ...containerStyle } }>
				{ style => (
					<animated.div className="style-preview__preview-iframe-container" style={ style }>
						<animated.iframe
							ref={ iframe }
							className={ classNames( {
								'style-preview__iframe': true,
								hideScroll: viewport !== 'desktop',
							} ) }
							title="preview"
						/>
					</animated.div>
				) }
			</Spring>
		</div>
	);
};

export default Preview;
