/**
 * External dependencies
 */
import { HorizontalRule } from '@wordpress/components';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { MarketplaceThemeProps } from 'calypso/my-sites/plugins/marketplace';

export const MobileHiddenHorizontalRule = styled( HorizontalRule )< MarketplaceThemeProps >`
	@media ( ${ ( { theme } ) => theme?.breakpoints.tabletDown } ) {
		display: none;
	}
`;
