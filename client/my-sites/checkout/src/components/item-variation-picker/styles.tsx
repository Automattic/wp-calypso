import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { CheckIcon } from '../check-icon';
import { CurrentOptionProps, OptionProps } from './types';

export const CurrentOption = styled.button< CurrentOptionProps >`
	align-items: center;
	background: white;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColor };
	border-radius: 3px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 14px 16px;
	width: 100%;
	cursor: pointer;

	.gridicon {
		fill: #a7aaad;
		margin-inline-start: 14px;
	}

	${ ( props ) =>
		props.open &&
		! props.detached &&
		css`
			border-radius: 3px 3px 0 0;
		` }
`;

export const Option = styled.li< OptionProps >`
	background: white;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColor };
	color: #646970;
	display: flex;
	font-size: ${ ( props ) => props.theme.fontSize.small };
	font-weight: ${ ( props ) => props.theme.weights.normal };
	cursor: pointer;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	/* the calc aligns the price with the price in CurrentOption */
	padding: 10px calc( 14px + 24px + 16px ) 10px 16px;
	position: relative;

	${ ( props ) =>
		props.detached &&
		css`
			padding-top: 14px;
			padding-bottom: 14px;
		` }

	&:hover {
		background: var( --studio-wordpress-blue-5 );
	}

	${ ( props ) =>
		! props.detached
			? css`
					&.item-variant-option--selected {
						background: var( --studio-wordpress-blue-50 );
						color: #fff;
					}
			  `
			: css`
					&.item-variant-option--selected * {
						color: var( --studio-black );
					}
			  ` }
`;

export const WPCheckoutCheckIcon = styled( CheckIcon )`
	fill: ${ ( props ) => props.theme.colors.success };
	margin-right: 4px;
	position: absolute;
	top: 50%;
	right: 16px;
	transform: translateY( -50% );
	.rtl & {
		margin-right: 0;
		margin-left: 4px;
		right: auto;
		left: 16px;
	}
`;

export const Dropdown = styled.div`
	position: relative;
	width: 100%;
	margin: 16px 0;

	> ${ Option } {
		border-radius: 3px;
	}
`;

export const OptionList = styled.ul< { detached: boolean } >`
	position: absolute;
	width: 100%;
	z-index: 4;
	margin: 0;
	box-shadow: rgba( 0, 0, 0, 0.16 ) 0px 1px 4px;
	${ ( props ) =>
		props.detached &&
		css`
			box-shadow:
				0px 50px 43px 0px rgba( 0, 0, 0, 0.02 ),
				0px 30px 36px 0px rgba( 0, 0, 0, 0.04 ),
				0px 15px 27px 0px rgba( 0, 0, 0, 0.07 ),
				0px 5px 15px 0px rgba( 0, 0, 0, 0.08 );
			margin-top: 10px;

			${ Option }:first-of-type {
				border-top-left-radius: 3px;
				border-top-right-radius: 3px;
			}
		` }

	${ Option } {
		margin-top: -1px;

		&:last-child {
			border-bottom-left-radius: 3px;
			border-bottom-right-radius: 3px;
		}
	}
`;

export const Discount = styled.span`
	color: ${ ( props ) => props.theme.colors.discount };
	margin-right: 8px;
	font-size: 100%;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}

	.item-variant-option--selected & {
		color: var( --studio-green-5 );

		.is-jetpack & {
			color: var( --studio-white );
		}
	}

	@media ( max-width: 660px ) {
		width: 100%;
	}
`;

export const DiscountAbsolute = styled.span< {
	color: string;
	backgroundColor: string;
} >`
	text-align: center;
	color: ${ ( props ) => props.color };
	display: block;
	background-color: ${ ( props ) => props.backgroundColor };
	padding: 0 10px;
	border-radius: 4px;
	font-size: 12px;
	line-height: 20px;
	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
	// Keep selected state override for now, adjust if needed
	.item-variant-option--selected & {
		color: ${ ( props ) => props.color };
	}
`;

export const DoNotPayThis = styled.del`
	text-decoration: line-through;
	margin-right: 8px;
	color: var( --studio-gray-50 );

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}

	.item-variant-option--selected & {
		color: var( --studio-white );
	}
`;

export const Price = styled.span`
	display: inline-flex;
	justify-content: right;
	color: var( --studio-gray-50 );
	.item-variant-option--selected & {
		color: var( --studio-white );
	}
`;

export const Variant = styled.div`
	display: flex;
	align-items: center;
	font-size: 14px;
	font-weight: 400;
	justify-content: space-between;
	line-height: 20px;
	width: 100%;
	column-gap: 20px;
	flex-direciton: row;
	align-items: center;

	.item-variant-option--selected & {
		color: var( --studio-white );
	}
`;

export const Label = styled.span`
	display: flex;
	white-space: nowrap;
	font-size: 14px;
	color: var( --studio-black );

	.item-variant-option--selected & {
		color: var( --studio-white );
	}

	// MOBILE_BREAKPOINT is <480px, used in useMobileBreakpoint
	@media ( max-width: 480px ) {
		flex-direction: column;
		text-align: left;
	}
`;

export const IntroPricing = styled.span`
	display: flex;
	flex-direction: column;
	font-size: 0.8rem;
`;

export const IntroPricingText = styled.span`
	display: block;
	text-align: right;
	margin-bottom: 0rem;
`;

export const PriceTextContainer = styled.span`
	font-size: 14px;
	text-align: right;
`;
