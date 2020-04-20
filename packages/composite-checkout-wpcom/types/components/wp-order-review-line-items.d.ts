export function WPOrderReviewSection( {
	children,
	className,
}: {
	children: any;
	className: any;
} ): JSX.Element;
export namespace WPOrderReviewSection {
	export namespace propTypes {
		export const className: PropTypes.Requireable< string >;
	}
}
export function WPOrderReviewTotal( {
	total,
	className,
}: {
	total: any;
	className: any;
} ): JSX.Element;
export function WPOrderReviewLineItems( {
	items,
	className,
	isSummaryVisible,
	removeItem,
}: {
	items: any;
	className: any;
	isSummaryVisible: any;
	removeItem: any;
} ): JSX.Element;
export namespace WPOrderReviewLineItems {
	export namespace propTypes_1 {
		const className_1: PropTypes.Requireable< string >;
		export { className_1 as className };
		export const isSummaryVisible: PropTypes.Requireable< boolean >;
		export const removeItem: PropTypes.Requireable< ( ...args: any[] ) => any >;
		export const items: PropTypes.Requireable<
			(
				| PropTypes.InferProps< {
						label: PropTypes.Requireable< string >;
						amount: PropTypes.Requireable<
							PropTypes.InferProps< {
								displayValue: PropTypes.Requireable< string >;
							} >
						>;
				  } >
				| null
				| undefined
			 )[]
		>;
	}
	export { propTypes_1 as propTypes };
}
import PropTypes from 'prop-types';
