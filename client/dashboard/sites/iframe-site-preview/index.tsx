export default function SitePreview( {
	url,
	scale = 1,
	width = 1200,
	height = 800,
}: {
	url: string;
	scale?: number;
	width?: number;
	height?: number;
} ) {
	// The /sites endpoint may return non-secure URLs. Often these _can_ be
	// loaded securely, so it's worth trying to load over https. If it fails,
	// there would have been an error either way because the dasboard is loaded
	// over https.
	// To do: check why the endpoint returns non-secure URLs when it will
	// redirect to a secure URL.
	const secureUrl = url.replace( /^http:\/\//, 'https://' );
	return (
		<iframe
			loading="lazy"
			// @ts-expect-error For some reason there's no inert type.
			inert="true"
			title="Site Preview"
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
