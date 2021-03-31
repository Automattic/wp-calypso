/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import FormattedHeader from 'calypso/components/formatted-header';
import { hasGSuiteSupportedDomain, hasGSuiteWithUs } from 'calypso/lib/gsuite';
import getGSuiteUsers from 'calypso/state/selectors/get-gsuite-users';
import hasLoadedGSuiteUsers from 'calypso/state/selectors/has-loaded-gsuite-users';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import EmptyContent from 'calypso/components/empty-content';
import DocumentHead from 'calypso/components/data/document-head';
import QueryGSuiteUsers from 'calypso/components/data/query-gsuite-users';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import EmailProvidersComparison from '../email-providers-comparison';
import { hasTitanMailWithUs } from 'calypso/lib/titan';
import hasLoadedSites from 'calypso/state/selectors/has-loaded-sites';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import HeaderCart from 'calypso/my-sites/checkout/cart/header-cart';
import SectionHeader from 'calypso/components/section-header';
import { Card } from '@automattic/components';
import EmailListActive from 'calypso/my-sites/email/email-management/home/email-list-active';
import EmailListInactive from 'calypso/my-sites/email/email-management/home/email-list-inactive';
import EmailPlan from 'calypso/my-sites/email/email-management/home/email-plan';

/**
 * Style dependencies
 */
import './style.scss';

class EmailManagementHome extends React.Component {
	static propTypes = {
		canManageSite: PropTypes.bool.isRequired,
		domains: PropTypes.array.isRequired,
		gsuiteUsers: PropTypes.array,
		hasGSuiteUsersLoaded: PropTypes.bool.isRequired,
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
			return this.renderContentWithHeader( <div>no domains</div> );
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
				{ selectedSiteId && <QueryGSuiteUsers siteId={ selectedSiteId } /> }
				{ selectedSiteId && <QuerySiteDomains siteId={ selectedSiteId } /> }
				<DocumentHead title={ translate( 'Emails' ) } />
				<SidebarNavigation />
				<div className="email-home__header">
					<FormattedHeader
						brandFont
						className="email-management__page-heading"
						headerText={ translate( 'Emails' ) }
						subHeaderText={ translate(
							'Your home base for accessing, setting up, and managing your emails.'
						) }
						align="left"
					/>
					<div className="email-home__header-cart">
						{ selectedSite && (
							<HeaderCart currentRoute={ currentRoute } selectedSite={ selectedSite } />
						) }
					</div>
				</div>
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
		gsuiteUsers: getGSuiteUsers( state, selectedSiteId ),
		hasGSuiteUsersLoaded: hasLoadedGSuiteUsers( state, selectedSiteId ),
		hasSiteDomainsLoaded: hasLoadedSiteDomains( state, selectedSiteId ),
		hasSitesLoaded: hasLoadedSites( state ),
		previousRoute: getPreviousRoute( state ),
		selectedSite: getSelectedSite( state ),
		selectedSiteId,
		selectedSiteSlug: getSelectedSiteSlug( state ),
	};
} )( localize( EmailManagementHome ) );
