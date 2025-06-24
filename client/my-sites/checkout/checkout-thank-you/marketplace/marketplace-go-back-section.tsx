import MasterbarStyled from '../redesign-v2/masterbar-styled';
import { hasMultipleProductTypes } from './utils';

export function MarketplaceGoBackSection( {
	pluginSlugs,
	themeSlugs,
}: {
	pluginSlugs: string[];
	themeSlugs: string[];
} ): JSX.Element | null {
	const multipleProductTypes = hasMultipleProductTypes( [ pluginSlugs, themeSlugs ] );

	if ( multipleProductTypes || pluginSlugs.length > 0 || themeSlugs.length > 0 ) {
		return <MasterbarStyled />;
	}

	return null;
}
