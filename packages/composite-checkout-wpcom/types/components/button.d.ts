declare function Button( {
	buttonState,
	buttonType,
	onClick,
	className,
	fullWidth,
	children,
	...props
}: {
	[ x: string ]: any;
	buttonState: any;
	buttonType: any;
	onClick: any;
	className: any;
	fullWidth: any;
	children: any;
} ): JSX.Element;
declare namespace Button {
	export namespace propTypes {
		export const buttonState: PropTypes.Requireable< string >;
		export const buttonType: PropTypes.Requireable< string >;
		export const onClick: PropTypes.Requireable< ( ...args: any[] ) => any >;
		export const fullWidth: PropTypes.Requireable< boolean >;
	}
}
export default Button;
import PropTypes from 'prop-types';
