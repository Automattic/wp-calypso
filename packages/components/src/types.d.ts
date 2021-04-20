declare module 'gridicons';

declare module '*.svg' {
	const url: string;
	export default url;
}
declare module '@wordpress/components' {
	export function VisuallyHidden( props: {
		children: React.ReactNode;
		as?: React.ElementType;
		className?: string;
	} ): JSX.Element;
}
