import CustomALink from '../custom-a-link';

export function FullscreenLink( {
	children,
	...props
}: React.AnchorHTMLAttributes< HTMLAnchorElement > ) {
	return (
		<CustomALink { ...props } openInNewTab>
			{ children }
		</CustomALink>
	);
}
