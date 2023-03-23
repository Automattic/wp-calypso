import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'react-redux';
import MasterbarStyled from 'calypso/my-sites/marketplace/components/masterbar-styled';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

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
			backText={ translate( 'Back to home' ) }
			canGoBack={ areAllProductsFetched }
		/>
	);
}

/**
 * Check if there are more than 1 product type slugs
 *
 * @param productSlugs An array of product slugs for each product type
 * @returns boolean Whether there are more than multiple product type slugs
 */
function hasMultipleProductTypes( productSlugs: Array< string[] > ): boolean {
	const nonEmptyProductSlugs = productSlugs.filter( ( slugs ) => slugs.length !== 0 );

	return nonEmptyProductSlugs.length > 1;
}
