import { hasCheckoutVersion } from '@automattic/wpcom-checkout';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { CurrentOptionProps, OptionProps } from './types';

export const CurrentOption = styled.button< CurrentOptionProps >`
	align-items: center;
	background: white;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColor };
	border-radius: 3px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: ${ hasCheckoutVersion( '2' ) ? '4px 16px' : '14px 16px' };
	width: 100%;
	cursor: pointer;

	.gridicon {
		fill: #a7aaad;
		margin-left: 14px;
	}

	${ ( props ) =>
		props.open &&
		css`
			border-radius: 3px 3px 0 0;
		` }
`;

export const Option = styled.li< OptionProps >`
	align-items: center;
	background: white;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColor };
	color: #646970;
	display: flex;
	flex-direction: row;
	font-size: ${ ( props ) => props.theme.fontSize.small };
	font-weight: ${ ( props ) => props.theme.weights.normal };
	justify-content: space-between;
	/* the calc aligns the price with the price in CurrentOption */
	padding: 10px calc( 14px + 24px + 16px ) 10px 16px;
	cursor: pointer;

	&:hover {
		background: #e9f0f5;

		.is-jetpack & {
			background: var( --studio-gray-0 );
		}
	}

	&.item-variant-option--selected {
		background: #055d9c;

		.is-jetpack & {
			background: var( --studio-gray-80 );
		}
	}
`;

export const Dropdown = styled.div`
	position: relative;
	width: 100%;
	margin: ${ hasCheckoutVersion( '2' ) ? '6px 0' : '16px 0' };
	> ${ Option } {
		border-radius: 3px;
	}
`;

export const OptionList = styled.ul`
	position: absolute;
	width: 100%;
	z-index: 1;
	margin: 0;

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

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}

	.item-variant-option--selected & {
		color: #b8e6bf;

		.is-jetpack & {
			color: #fff;
		}
	}

	@media ( max-width: 660px ) {
		width: 100%;
	}
`;

export const DoNotPayThis = styled.del`
	text-decoration: line-through;
	margin-right: 8px;
	color: #646970;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}

	.item-variant-option--selected & {
		color: #fff;
	}
`;

export const Price = styled.span`
	display: inline-flex;
	justify-content: right;
	color: #646970;
	.item-variant-option--selected & {
		color: #fff;
	}
`;

export const Variant = styled.div`
	align-items: center;
	display: flex;
	font-size: 14px;
	font-weight: 400;
	justify-content: space-between;
	line-height: 20px;
	width: 100%;
	column-gap: 20px;

	.item-variant-option--selected & {
		color: #fff;
	}
`;

export const Label = styled.span`
	display: flex;
	white-space: nowrap;
	font-size: ${ hasCheckoutVersion( '2' ) ? '12px' : 'inherit' };
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
	text-align: right;
	font-size: ${ hasCheckoutVersion( '2' ) ? '12px' : 'inherit' };
`;
