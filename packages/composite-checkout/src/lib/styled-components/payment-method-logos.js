/**
 * External dependencies
 */
import styled from '@emotion/styled';

export const PaymentMethodLogos = styled.span`
	flex: 1;
	${ ( props ) => ( props.isRTL ? 'text-align: left;' : 'text-align: right;' ) }
	transform: translateY( 3px );

	svg {
		display: inline-block;
	}
`;
