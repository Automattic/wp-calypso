declare module '@wordpress/components' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const Button: React.ComponentType< Props >;
	export const Card: React.ComponentType< Props >;
	export const CardBody: React.ComponentType< Props >;
	export const CardFooter: React.ComponentType< Props >;
	export const CardMedia: React.ComponentType< Props >;
	export const Flex: React.ComponentType< Props >;
}
