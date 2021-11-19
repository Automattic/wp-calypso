import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementDns,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isPrimaryDomainBySiteId from 'calypso/state/selectors/is-primary-domain-by-site-id';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const TransferPage = (): JSX.Element => {
	const renderBreadcrumbs = () => {
		const items = [
			{
				label: translate( 'Domains', { comment: 'Internet domains, e.g. mygroovydomain.com' } ),
				href: domainManagementList( selectedSite.slug, selectedDomainName ),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite.slug, selectedDomainName, currentRoute ),
			},
			{
				label: translate( 'Transfer', { comment: 'Verb - Transfer a domain somewhere else' } ),
			},
		];

		const mobileItem = {
			label: translate( 'Back to %(domain)s', {
				args: { domain: selectedDomainName },
				comment: 'Link to return to the settings management page of a domain ',
			} ),
			href: domainManagementDns( selectedSite.slug, selectedDomainName ),
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	return (
		<Main className="transfer-page" wideLayout>
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ renderBreadcrumbs() }
			The page goes here
		</Main>
	);
};

const transferPageComponent = connect( ( state, ownProps ) => {
	const domain = getSelectedDomain( ownProps );
	const siteId = getSelectedSiteId( state );
	return {
		currentRoute: getCurrentRoute( state ),
		hasSiteDomainsLoaded: hasLoadedSiteDomains( state, siteId ),
		isAtomic: isSiteAutomatedTransfer( state, siteId ),
		isDomainOnly: isDomainOnlySite( state, siteId ),
		isMapping: Boolean( domain ) && isMappedDomain( domain ),
		isPrimaryDomain: isPrimaryDomainBySiteId( state, siteId, ownProps.selectedDomainName ),
		primaryDomain: getPrimaryDomainBySiteId( state, siteId ),
	};
} )( TransferPage );

export default transferPageComponent;
