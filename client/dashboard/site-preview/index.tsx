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
	return (
		<iframe
			loading="lazy"
			// @ts-expect-error For some reason there's no inert type.
			inert="true"
			title="Site Preview"
			// See mu-plugins/theme-preview.php + preview hides cookie banners + iframe hides admin bar for atomic sites.
			src={ `${ url }/?theme&hide_banners=true&preview_overlay=true&preview=true&iframe=true` }
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
