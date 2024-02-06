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
	${ hasCheckoutVersion( '2' ) ? `padding:4px 16px; height: 40px` : `padding:14px 16px` };
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
	background: white;
	border: 1px solid ${ ( props ) => props.theme.colors.borderColor };
	color: #646970;
	display: flex;
	font-size: ${ ( props ) => props.theme.fontSize.small };
	font-weight: ${ ( props ) => props.theme.weights.normal };
	cursor: pointer;

	${
		hasCheckoutVersion( '2' )
			? `flex-direction: column;
		align-items: flex-start;
		padding: 10px; height: 40px;`
			: `flex-direction: row;
		justify-content: space-between; align-items: center;
		/* the calc aligns the price with the price in CurrentOption */
		padding: 10px calc( 14px + 24px + 16px ) 10px 16px; height: null;`
	}


	&:hover {
		var( --studio-blue-0 );
	}

	&.item-variant-option--selected {
		background: #055d9c;
		color: #fff;
	}
`;

export const Dropdown = styled.div`
	position: relative;
	width: 100%;
	margin: ${ hasCheckoutVersion( '2' ) ? null : '16px 0' };
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
	${ hasCheckoutVersion( '2' ) ? `align-items: left` : `align-items: center` }

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
	font-size: 14px;
	font-weight: 400;
	justify-content: space-between;
	line-height: 20px;
	width: 100%;
	column-gap: 20px;

	${ hasCheckoutVersion( '2' )
		? `flex-direction: column; align-items: left`
		: `flex-direciton: row; align-items: center` }

	.item-variant-option--selected & {
		color: var( --studio-white );
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
	${ hasCheckoutVersion( '2' )
		? 'font-size: 12px; text-align: initial;'
		: 'font-size: inherit;	text-align: right;' };
`;
