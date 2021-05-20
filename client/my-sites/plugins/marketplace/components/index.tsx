/**
 * External dependencies
 */
import { HorizontalRule } from '@wordpress/components';
import styled from '@emotion/styled';
import { Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import { MarketplaceThemeProps } from 'calypso/my-sites/plugins/marketplace/theme';

export const MobileHiddenHorizontalRule = styled( HorizontalRule )< MarketplaceThemeProps >`
	@media ( ${ ( { theme } ) => theme?.breakpoints.tabletDown } ) {
		display: none;
	}
`;
export const MarketplaceHeaderTitle = styled.h1`
	font-size: ${ ( { subtitle = false } ) => ( subtitle ? '1.5em' : '2em' ) };
	margin-bottom: 8px;
`;

export const FullWidthButton = styled( Button )`
	justify-content: center;
	width: 100%;
	margin-bottom: 15px;
`;
