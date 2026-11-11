import { __ } from '@wordpress/i18n';
import { getPrototypePreviewImage } from './prototype-preview-image';

export default function SitePreview( {
	url,
	scale = 1,
	width = 1200,
	height = 800,
	onLoad,
}: {
	url: string;
	scale?: number;
	width?: number;
	height?: number;
	onLoad?: () => void;
} ) {
	// Prototype: on a remote MSD (calypso.live) the local Studio sites backing
	// the mock sites are unreachable, so their cards show a static screenshot.
	const mockPreviewImage = getPrototypePreviewImage( url );
	if ( mockPreviewImage ) {
		return (
			<img
				src={ mockPreviewImage }
				alt={ __( 'Site Preview' ) }
				style={ {
					display: 'block',
					// Global `img { max-width: 100% }` would shrink the image to the
					// card before the scale is applied, leaving a tiny thumbnail.
					maxWidth: 'none',
					width,
					height,
					objectFit: 'cover',
					objectPosition: 'top left',
					transform: `scale(${ scale })`,
					transformOrigin: 'top left',
				} }
				width={ width }
				height={ height }
			/>
		);
	}
	// The /sites endpoint may return non-secure URLs. Often these _can_ be
	// loaded securely, so it's worth trying to load over https. If it fails,
	// there would have been an error either way because the dasboard is loaded
	// over https.
	// To do: check why the endpoint returns non-secure URLs when it will
	// redirect to a secure URL.
	// Local Studio sites (prototype) only speak plain http.
	const secureUrl = /^http:\/\/localhost(:\d+)?($|\/)/.test( url )
		? url
		: url.replace( /^http:\/\//, 'https://' );
	return (
		<iframe
			// Enabling sandbox disables most features, such as autoplay,
			// alerts, popups, fullscreen, etc.
			sandbox="allow-scripts allow-same-origin"
			// Officially deprecated, but still widely supported. Hides
			// scrollbars in case they are set to always visible.
			scrolling="no"
			loading="lazy"
			// @ts-expect-error For some reason there's no inert type.
			inert="true"
			title={ __( 'Site Preview' ) }
			onLoad={ onLoad }
			// Hide banners + `preview` hides cookie banners + `iframe` hides
			// admin bar for atomic sites.
			src={ `${ secureUrl }/?hide_banners=true&preview=true&iframe=true` }
			style={ {
				display: 'block',
				border: 'none',
				transform: `scale(${ scale })`,
				transformOrigin: 'top left',
			} }
			width={ width }
			height={ height }
		/>
	);
}
