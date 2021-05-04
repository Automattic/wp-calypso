/**
 * External dependencies
 */
import { HorizontalRule } from '@wordpress/components';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import { MarketplaceThemeType } from 'calypso/my-sites/plugins/marketplace';

export const MobileHiddenHorizontalRule = styled( HorizontalRule )< {
	theme?: MarketplaceThemeType;
} >`
	@media ( ${ ( { theme } ) => theme?.breakpoints.tabletDown } ) {
		display: none;
	}
`;
