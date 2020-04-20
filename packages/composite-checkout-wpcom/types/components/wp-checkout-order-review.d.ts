declare function WPCheckoutOrderReview( {
	className,
	removeItem,
	siteUrl,
}: {
	className: any;
	removeItem: any;
	siteUrl: any;
} ): JSX.Element;
declare namespace WPCheckoutOrderReview {
	export namespace propTypes {
		export const summary: PropTypes.Requireable< boolean >;
		export const className: PropTypes.Requireable< string >;
		export const removeItem: PropTypes.Validator< ( ...args: any[] ) => any >;
		export const siteUrl: PropTypes.Requireable< string >;
	}
}
export default WPCheckoutOrderReview;
import PropTypes from 'prop-types';
