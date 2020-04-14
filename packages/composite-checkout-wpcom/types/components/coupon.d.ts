declare function Coupon( {
	id,
	couponAdded,
	className,
	disabled,
}: {
	id: any;
	couponAdded: any;
	className: any;
	disabled: any;
} ): JSX.Element | null;
declare namespace Coupon {
	export namespace propTypes {
		export const id: PropTypes.Validator< string >;
		export const couponAdded: PropTypes.Requireable< ( ...args: any[] ) => any >;
		export const disabled: PropTypes.Requireable< boolean >;
	}
}
export default Coupon;
import PropTypes from 'prop-types';
