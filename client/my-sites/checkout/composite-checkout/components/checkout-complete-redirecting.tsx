import { CheckoutStepBody } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
import { SiteData } from 'calypso/state/ui/selectors/site-data';

export function CheckoutCompleteRedirecting(): JSX.Element {
	return (
		<CheckoutStepBody
			stepId="checkout-complete-redirecting"
			isStepActive={ false }
			isStepComplete={ true }
			titleContent={ <CheckoutCompleteRedirectingTitle /> }
		/>
	);
}

function ForceFeaturesReload(): JSX.Element {
	const selectedOrAllSites = useSelector( getSelectedOrAllSites );
	const sites = selectedOrAllSites.filter( ( site ) => site !== null ) as SiteData[];
	return (
		<QuerySiteFeatures siteIds={ sites.map( ( site ) => site.ID ) } cacheBust="checkout-complete" />
	);
}

function CheckoutCompleteRedirectingTitle(): JSX.Element {
	const translate = useTranslate();
	return (
		<>
			{ translate( 'Your purchase has been completed!' ) }
			<ForceFeaturesReload />
		</>
	);
}
