import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ActionCard from 'calypso/components/action-card';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import {
	domainManagementTransferToAnotherUser,
	domainManagementTransferToOtherSite,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isPrimaryDomainBySiteId from 'calypso/state/selectors/is-primary-domain-by-site-id';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const TransferPage = ( { selectedSite, selectedDomainName, currentRoute, translate } ) => {
	return (
		<Main wideLayout className="transfer-page">
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			<Card>
				<ActionCard
					buttonHref={ domainManagementTransferToAnotherUser(
						selectedSite.slug,
						selectedDomainName,
						currentRoute
					) }
					buttonText={ translate( 'Continue', { context: 'Verb' } ) }
					headerText={ translate( 'To another user', {
						comment: 'Transfer a domain to another user',
					} ) }
					mainText={ translate( 'Transfer this domain to any administrator on this site' ) }
				/>
				<div className="transfer-page__item-separator"></div>
				<ActionCard
					buttonHref={ domainManagementTransferToOtherSite(
						selectedSite.slug,
						selectedDomainName,
						currentRoute
					) }
					buttonText={ translate( 'Continue', { context: 'Verb' } ) }
					headerText={ translate( 'To another WordPress.com site', {
						comment: 'Transfer a domain to another WordPress.com site',
					} ) }
					mainText={ translate( 'Transfer this domain to any site you are an administrator on' ) }
				/>
			</Card>
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
} )( localize( TransferPage ) );

transferPageComponent.propTypes = {
	selectedDomainName: PropTypes.string.isRequired,
};

export default transferPageComponent;
