import MasterbarStyled from '../redesign-v2/masterbar-styled';
import { hasMultipleProductTypes } from './utils';

export function MarketplaceGoBackSection( {
	pluginSlugs,
	themeSlugs,
	pluginsGoBackSection,
	themesGoBackSection,
}: {
	pluginSlugs: string[];
	themeSlugs: string[];
	pluginsGoBackSection: JSX.Element;
	themesGoBackSection: JSX.Element;
	areAllProductsFetched: boolean;
} ): JSX.Element | null {
	const multipleProductTypes = hasMultipleProductTypes( [ pluginSlugs, themeSlugs ] );

	if ( multipleProductTypes ) {
		return <MasterbarStyled />;
	}

	if ( pluginSlugs.length > 0 ) {
		return pluginsGoBackSection;
	}

	if ( themeSlugs.length > 0 ) {
		return themesGoBackSection;
	}

	return null;
}
