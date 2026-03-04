import { __ } from '@wordpress/i18n';

export default function SitePreview( {
	url,
	scale = 1,
	width = 1200,
	height = 800,
	naSitePreview = false,
}: {
	url: string;
	scale?: number;
	width?: number;
	height?: number;
	naSitePreview?: boolean;
} ) {
	// The /sites endpoint may return non-secure URLs. Often these _can_ be
	// loaded securely, so it's worth trying to load over https. If it fails,
	// there would have been an error either way because the dasboard is loaded
	// over https.
	// To do: check why the endpoint returns non-secure URLs when it will
	// redirect to a secure URL.
	const secureUrl = url.replace( /^http:\/\//, 'https://' );
	const params =
		'hide_banners=true&preview=true&iframe=true' + ( naSitePreview ? '&na_site_preview=1' : '' );
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
			// Hide banners + `preview` hides cookie banners + `iframe` hides
			// admin bar for atomic sites.
			src={ `${ secureUrl }/?${ params }` }
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
