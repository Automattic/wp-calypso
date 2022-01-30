import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titleCase from 'to-title-case';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { hasGSuiteWithUs } from 'calypso/lib/gsuite';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import EmailHeader from 'calypso/my-sites/email/email-header';
import EmailListActive from 'calypso/my-sites/email/email-management/home/email-list-active';
import EmailListInactive from 'calypso/my-sites/email/email-management/home/email-list-inactive';
import EmailNoDomain from 'calypso/my-sites/email/email-management/home/email-no-domain';
import EmailPlan from 'calypso/my-sites/email/email-management/home/email-plan';
import EmailProvidersStackedComparison from 'calypso/my-sites/email/email-providers-stacked-comparison';
import { emailManagement, emailManagementTitanSetUpMailbox } from 'calypso/my-sites/email/paths';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

import './style.scss';

class EmailManagementHome extends Component {
	static propTypes = {
		canManageSite: PropTypes.bool.isRequired,
		domains: PropTypes.array.isRequired,
		hasSiteDomainsLoaded: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string,
		selectedSiteId: PropTypes.number.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
		emailListInactiveHeader: PropTypes.element,
		showActiveDomainList: PropTypes.bool,
		sectionHeaderLabel: PropTypes.string,
		source: PropTypes.string,
	};

	render() {
		const {
			canManageSite,
			currentRoute,
			domains,
			emailListInactiveHeader,
			hasSiteDomainsLoaded,
			hasSitesLoaded,
			showActiveDomainList = true,
			selectedDomainName,
			selectedSite,
			selectedSiteId,
			sectionHeaderLabel,
			source,
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
				return (
					<EmailProvidersStackedComparison
						comparisonContext="email-home-selected-domain"
						selectedDomainName={ selectedDomainName }
						source={ source }
					/>
				);
			}

			return this.renderContentWithHeader(
				'email-plan',
				<EmailPlan selectedSite={ selectedSite } domain={ selectedDomain } source={ source } />
			);
		}

		const nonWpcomDomains = domains.filter( ( domain ) => ! domain.isWPCOMDomain );

		if ( nonWpcomDomains.length < 1 ) {
			return this.renderContentWithHeader(
				'email-no-plan',
				<EmailNoDomain selectedSite={ selectedSite } source={ source } />
			);
		}

		const domainsWithEmail = nonWpcomDomains.filter( domainHasEmail );
		const domainsWithNoEmail = nonWpcomDomains.filter( ( domain ) => ! domainHasEmail( domain ) );

		if ( domainsWithEmail.length < 1 && domainsWithNoEmail.length === 1 ) {
			return (
				<>
					<PageViewTracker
						path={ emailManagement( ':site', selectedDomainName ?? null ) }
						title={ 'Email Home' }
						properties={ { source, context: 'email-home-single-domain' } }
					/>
					<EmailProvidersStackedComparison
						comparisonContext="email-home-single-domain"
						selectedDomainName={ domainsWithNoEmail[ 0 ].name }
						source={ source }
					/>
				</>
			);
		}

		if (
			domainsWithEmail.length === 1 &&
			domainsWithNoEmail.length === 0 &&
			domainsWithEmail[ 0 ].domain === selectedSite.domain &&
			domainsWithEmail[ 0 ].titanMailSubscription?.maximumMailboxCount > 0 &&
			domainsWithEmail[ 0 ].titanMailSubscription?.numberOfMailboxes === 0
		) {
			page( emailManagementTitanSetUpMailbox( selectedSite.slug, selectedSite.domain ) );
		}

		return this.renderContentWithHeader(
			'mail-list',
			<>
				{ showActiveDomainList && (
					<EmailListActive
						currentRoute={ currentRoute }
						domains={ domainsWithEmail }
						selectedSiteId={ selectedSiteId }
						selectedSiteSlug={ selectedSite.slug }
						source={ source }
					/>
				) }

				<EmailListInactive
					currentRoute={ currentRoute }
					domains={ domainsWithNoEmail }
					headerComponent={ emailListInactiveHeader }
					sectionHeaderLabel={ sectionHeaderLabel }
					selectedSiteSlug={ selectedSite.slug }
					source={ source }
				/>
			</>
		);
	}

	renderNoAccess() {
		const { translate } = this.props;

		return this.renderContentWithHeader(
			'no-access',
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
			'placeholder',
			<>
				<SectionHeader className="email-home__section-placeholder is-placeholder" />
				<Card className="email-home__content-placeholder is-placeholder" />
			</>
		);
	}

	renderContentWithHeader( context, content ) {
		const { source, selectedDomainName, selectedSiteId, translate } = this.props;

		return (
			<Main wideLayout>
				<PageViewTracker
					path={ emailManagement( ':site', selectedDomainName ?? null ) }
					title={ 'Email Home' }
					properties={ { source, context } }
				/>

				{ selectedSiteId && <QuerySiteDomains siteId={ selectedSiteId } /> }

				<DocumentHead title={ titleCase( translate( 'Emails' ) ) } />

				<SidebarNavigation />

				<EmailHeader />

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
