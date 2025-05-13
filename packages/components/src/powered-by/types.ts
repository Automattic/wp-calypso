//==================================================
// Low-level types
//==================================================
/**
 * Render prop type.
 * @template P Props
 * @example
 * const children: RenderProp = (props) => <div {...props} />;
 */
// type RenderProp<
// 	P = React.HTMLAttributes< any > & {
// 		ref?: React.Ref< any >;
// 	},
// > = ( props: P ) => React.ReactNode;

//==================================================
// PoweredBy component
//==================================================
interface PoweredByLogoProps {
	size?: number;
	className?: string;
}

export interface PoweredByProps extends React.HTMLAttributes< HTMLElement > {
	renderLogo: // | RenderProp<
	// 		PoweredByLogoProps & {
	// 			ref?: React.Ref< HTMLElement >;
	// 		}
	//   >
	// |
	React.ReactElement<
		PoweredByLogoProps & {
			ref?: React.Ref< HTMLElement >;
		}
	>;
}
