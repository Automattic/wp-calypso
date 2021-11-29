import { Card } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { connect } from 'react-redux';
import ActionCard from 'calypso/components/action-card';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import {
	domainManagementEdit,
	domainManagementList,
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
import type { TransferPageProps } from './types';

import './style.scss';

const TransferPage = ( props: TransferPageProps ): JSX.Element => {
	const { __ } = useI18n();
	const {
		currentRoute,
		isAtomic,
		isDomainOnly,
		isPrimaryDomain,
		selectedDomainName,
		selectedSite,
	} = props;

	const renderBreadcrumbs = () => {
		const items = [
			{
				// translators: Internet domains, e.g. mygroovydomain.com
				label: __( 'Domains' ),
				href: domainManagementList( selectedSite.slug, selectedDomainName ),
			},
			{
				label: selectedDomainName,
				href: domainManagementEdit( selectedSite.slug, selectedDomainName, currentRoute ),
			},
			{
				// translators: Verb - Transfer a domain somewhere else
				label: __( 'Transfer' ),
			},
		];

		const mobileItem = {
			label: sprintf(
				/* translators: Link to return to the settings management page of a specific domain (%s = domain, e.g. example.com) */
				__( 'Back to %s' ),
				selectedDomainName
			),
			href: domainManagementEdit( selectedSite.slug, selectedDomainName, currentRoute ),
			showBackArrow: true,
		};

		return <Breadcrumbs items={ items } mobileItem={ mobileItem } />;
	};

	const renderTransferOptions = () => {
		const options = [];

		if ( ! isDomainOnly ) {
			options.push(
				<ActionCard
					key="transfer-to-another-user"
					buttonHref={ domainManagementTransferToAnotherUser(
						selectedSite.slug,
						selectedDomainName,
						currentRoute
					) }
					// translators: Continue is a verb
					buttonText={ __( 'Continue' ) }
					// translators: Transfer a domain to another user
					headerText={ __( 'To another user' ) }
					mainText={ __( 'Transfer this domain to any administrator on this site' ) }
				/>
			);
		}

		if ( ! ( isPrimaryDomain && isAtomic ) ) {
			if ( options.length > 0 ) {
				options.push( <div key="separator" className="transfer-page__item-separator"></div> );
			}

			options.push(
				<ActionCard
					key="transfer-to-another-site"
					buttonHref={ domainManagementTransferToOtherSite(
						selectedSite.slug,
						selectedDomainName,
						currentRoute
					) }
					// translators: Continue is a verb
					buttonText={ __( 'Continue' ) }
					// translators: Transfer a domain to another WordPress.com site
					headerText={ __( 'To another WordPress.com site' ) }
					mainText={ __( 'Transfer this domain to any site you are an administrator on' ) }
				/>
			);
		}

		return options.length > 0 ? <Card>{ options }</Card> : null;
	};

	return (
		<Main className="transfer-page" wideLayout>
			<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
			{ renderBreadcrumbs() }
			{ renderTransferOptions() }
		</Main>
	);
};

const transferPageComponent = connect( ( state, ownProps: TransferPageProps ) => {
	const domain = getSelectedDomain( ownProps );
	const siteId = getSelectedSiteId( state )!;
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
