/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import DocumentHead from 'calypso/components/data/document-head';
import EmailHeader from 'calypso/my-sites/email/email-header';
import EmailListActive from 'calypso/my-sites/email/email-management/home/email-list-active';
import EmailListInactive from 'calypso/my-sites/email/email-management/home/email-list-inactive';
import EmailNoDomain from 'calypso/my-sites/email/email-management/home/email-no-domain';
import EmailPlan from 'calypso/my-sites/email/email-management/home/email-plan';
import EmailProvidersComparison from 'calypso/my-sites/email/email-providers-comparison';
import EmptyContent from 'calypso/components/empty-content';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteSupportedDomain, hasGSuiteWithUs } from 'calypso/lib/gsuite';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import Main from 'calypso/components/main';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import SectionHeader from 'calypso/components/section-header';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';

/**
 * Style dependencies
 */
import './style.scss';

class EmailManagementHome extends React.Component {
	static propTypes = {
		canManageSite: PropTypes.bool.isRequired,
		domains: PropTypes.array.isRequired,
		hasSiteDomainsLoaded: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string,
		selectedSiteId: PropTypes.number.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
	};

	render() {
		const {
			domains,
			hasSiteDomainsLoaded,
			hasSitesLoaded,
			canManageSite,
			selectedSite,
			selectedDomainName,
			currentRoute,
		} = this.props;

		if ( ! hasSiteDomainsLoaded || ! hasSitesLoaded || ! selectedSite ) {
			return this.renderLoadingPlaceholder();
		}

		if ( ! canManageSite ) {
			return this.renderNoAccess();
		}

		const domainHasEmail = ( domain ) =>
			hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain ) || hasEmailForwards( domain );

		if ( selectedDomainName ) {
			const selectedDomain = domains.find( ( domain ) => {
				return selectedDomainName === domain.name;
			} );

			if ( ! domainHasEmail( selectedDomain ) ) {
				return this.renderContentWithHeader(
					<EmailProvidersComparison
						domain={ selectedDomain }
						isGSuiteSupported={ hasGSuiteSupportedDomain( [ selectedDomain ] ) }
					/>
				);
			}
			return this.renderContentWithHeader(
				<EmailPlan selectedSite={ selectedSite } domain={ selectedDomain } />
			);
		}

		const nonWpcomDomains = domains.filter( ( domain ) => ! domain.isWPCOMDomain );

		if ( nonWpcomDomains.length < 1 ) {
			return this.renderContentWithHeader( <EmailNoDomain selectedSite={ selectedSite } /> );
		}

		const domainsWithEmail = nonWpcomDomains.filter( domainHasEmail );
		const domainsWithNoEmail = nonWpcomDomains.filter( ( domain ) => ! domainHasEmail( domain ) );

		if ( domainsWithEmail.length < 1 && domainsWithNoEmail.length === 1 ) {
			const firstDomainWithNoEmail = domainsWithNoEmail[ 0 ];
			return this.renderContentWithHeader(
				<EmailProvidersComparison
					domain={ firstDomainWithNoEmail }
					isGSuiteSupported={ hasGSuiteSupportedDomain( [ firstDomainWithNoEmail ] ) }
				/>
			);
		}

		return this.renderContentWithHeader(
			<>
				<EmailListActive
					domains={ domainsWithEmail }
					selectedSiteSlug={ selectedSite.slug }
					currentRoute={ currentRoute }
				/>
				<EmailListInactive
					domains={ domainsWithNoEmail }
					selectedSiteSlug={ selectedSite.slug }
					currentRoute={ currentRoute }
				/>
			</>
		);
	}

	renderNoAccess() {
		const { translate } = this.props;

		return this.renderContentWithHeader(
			<>
				<EmptyContent
					title={ translate( 'You are not authorized to view this page' ) }
					illustration={ '/calypso/images/illustrations/illustration-404.svg' }
				/>
			</>
		);
	}

	renderLoadingPlaceholder() {
		return this.renderContentWithHeader(
			<>
				<SectionHeader className="email-home__section-placeholder is-placeholder" />
				<Card className="email-home__content-placeholder is-placeholder" />
			</>
		);
	}

	renderContentWithHeader( content ) {
		const { translate, currentRoute, selectedSiteId, selectedSite } = this.props;

		return (
			<Main wideLayout>
				{ selectedSiteId && <QuerySiteDomains siteId={ selectedSiteId } /> }

				<DocumentHead title={ translate( 'Emails' ) } />

				<SidebarNavigation />

				<EmailHeader currentRoute={ currentRoute } selectedSite={ selectedSite } />

				{ content }
			</Main>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		canManageSite: canCurrentUser( state, selectedSiteId, 'manage_options' ),
		currentRoute: getCurrentRoute( state ),
		domains: getDomainsBySiteId( state, selectedSiteId ),
		hasSiteDomainsLoaded: hasLoadedSiteDomains( state, selectedSiteId ),
		hasSitesLoaded: hasLoadedSites( state ),
		previousRoute: getPreviousRoute( state ),
		selectedSite: getSelectedSite( state ),
		selectedSiteId,
		selectedSiteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( EmailManagementHome ) );
