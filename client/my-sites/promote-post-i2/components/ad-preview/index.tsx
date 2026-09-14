import './style.scss';
import clsx from 'clsx';
import { useEffect } from 'react';
import { BannerWidth } from 'calypso/my-sites/promote-post-i2/components/campaign-item-details/AdPreviewModal';

interface Props {
	htmlCode: string;
	templateFormat: string;
	isLoading?: boolean;
	width?: BannerWidth;
}

export default function AdPreview( { htmlCode, isLoading, templateFormat, width }: Props ) {
	const adWidth = width ? `${ width }` : '300px';

	// Responsive WPCOM templates emit the same `wa-inline-frame` postMessage
	// protocol to size the iframe.
	const isResponsiveHtmlFormat = [ 'html5_v2', 'html5_v3', 'html5_v4' ].includes( templateFormat );

	useEffect( () => {
		if ( ! isLoading && isResponsiveHtmlFormat ) {
			window.addEventListener( 'message', function ( msg ) {
				if ( typeof msg.data !== 'object' ) {
					return;
				}

				if ( msg.data.type !== 'wa-inline-frame' ) {
					return;
				}

				const iframes = document.getElementsByTagName( 'iframe' );

				for ( let i = 0; i < iframes.length; i++ ) {
					if ( iframes[ i ].contentWindow === msg.source ) {
						// Set the frame height. Use next highest int to fix rounding issues with Firefox.
						iframes[ i ].style.height = Math.ceil( msg.data.height ) + 'px';

						// Exit loop.
						break;
					}
				}
			} );
		}
	}, [ isLoading, isResponsiveHtmlFormat ] );

	if ( isLoading ) {
		return (
			<div className="campaign-item-details__preview-content">
				<div className="promote-post-ad-preview__loading" />
			</div>
		);
	}

	const classes = clsx( 'campaign-item-details__preview-content', {
		v02: templateFormat === 'html5_v2',
		v03: templateFormat === 'html5_v3',
		v04: templateFormat === 'html5_v4',
	} );

	return (
		<div className={ classes } style={ { width: adWidth } }>
			<iframe srcDoc={ htmlCode } title="adPreview" />
		</div>
	);
}
