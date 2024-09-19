import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import MasterbarStyled from '../redesign-v2/masterbar-styled';
import { hasMultipleProductTypes } from './utils';

export function MarketplaceGoBackSection( {
	pluginSlugs,
	themeSlugs,
	pluginsGoBackSection,
	themesGoBackSection,
	areAllProductsFetched,
}: {
	pluginSlugs: string[];
	themeSlugs: string[];
	pluginsGoBackSection: JSX.Element;
	themesGoBackSection: JSX.Element;
	areAllProductsFetched: boolean;
} ): JSX.Element | null {
	const multipleProductTypes = hasMultipleProductTypes( [ pluginSlugs, themeSlugs ] );

	if ( multipleProductTypes ) {
		return <DefaultGoBackSection areAllProductsFetched={ areAllProductsFetched } />;
	}

	if ( pluginSlugs.length > 0 ) {
		return pluginsGoBackSection;
	}

	if ( themeSlugs.length > 0 ) {
		return themesGoBackSection;
	}

	return null;
}

function DefaultGoBackSection( { areAllProductsFetched }: { areAllProductsFetched: boolean } ) {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<MasterbarStyled
			onClick={ () => page( `/home/${ siteSlug }` ) }
			backText={ translate( 'Back to dashboard' ) }
			canGoBack={ areAllProductsFetched }
			showContact={ areAllProductsFetched }
		/>
	);
}
