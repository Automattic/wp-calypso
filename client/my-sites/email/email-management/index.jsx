/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import Main from 'components/main';
import Header from 'my-sites/domains/domain-management/components/header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import FormattedHeader from 'components/formatted-header';
import {
	canUserPurchaseGSuite,
	getEligibleGSuiteDomain,
	hasGSuiteSupportedDomain,
	hasGSuiteWithAnotherProvider,
	hasGSuiteWithUs,
} from 'lib/gsuite';
import { getEligibleEmailForwardingDomain } from 'lib/domains/email-forwarding';
import getGSuiteUsers from 'state/selectors/get-gsuite-users';
import hasLoadedGSuiteUsers from 'state/selectors/has-loaded-gsuite-users';
import canCurrentUser from 'state/selectors/can-current-user';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'state/sites/domains/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import GSuitePurchaseCta from 'my-sites/email/gsuite-purchase-cta';
import GSuiteUsersCard from 'my-sites/email/email-management/gsuite-users-card';
import Placeholder from 'my-sites/email/email-management/gsuite-users-card/placeholder';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import EmptyContent from 'components/empty-content';
import { domainManagementEdit, domainManagementList } from 'my-sites/domains/paths';
import { emailManagementForwarding } from 'my-sites/email/paths';
import { getSelectedDomain, isMappedDomain, isMappedDomainWithWpcomNameservers } from 'lib/domains';
import DocumentHead from 'components/data/document-head';
import QueryEmailAccounts from 'components/data/query-email-accounts';
import QueryGSuiteUsers from 'components/data/query-gsuite-users';
import QuerySiteDomains from 'components/data/query-site-domains';
import { localizeUrl } from 'lib/i18n-utils';
import getCurrentRoute from 'state/selectors/get-current-route';
import EmailProvidersComparison from '../email-providers-comparison';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import customDomainImage from 'assets/images/illustrations/custom-domain.svg';

class EmailManagement extends React.Component {
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
		const { canManageSite, selectedDomainName, selectedSiteId } = this.props;

		if ( ! canManageSite ) {
			return (
				<Main>
					<SidebarNavigation />
					<EmptyContent
						title={ this.props.translate( 'You are not authorized to view this page' ) }
						illustration={ '/calypso/images/illustrations/illustration-404.svg' }
					/>
				</Main>
			);
		}

		return (
			<Main className="email-management" wideLayout>
				{ config.isEnabled( 'email-accounts/enabled' ) && selectedSiteId && (
					<QueryEmailAccounts siteId={ selectedSiteId } />
				) }
				{ selectedSiteId && <QueryGSuiteUsers siteId={ selectedSiteId } /> }
				{ selectedSiteId && <QuerySiteDomains siteId={ selectedSiteId } /> }
				<DocumentHead title={ this.props.translate( 'Email' ) } />
				<SidebarNavigation />
				{ ! selectedDomainName && (
					<FormattedHeader
						brandFont
						className="email-management__page-heading"
						headerText={ this.props.translate( 'Email' ) }
						align="left"
					/>
				) }

				{ this.headerOrPlansNavigation() }
				{ this.content() }
			</Main>
		);
	}

	headerOrPlansNavigation() {
		const { selectedDomainName, translate } = this.props;

		if ( selectedDomainName ) {
			return (
				<Header onClick={ this.goToEditOrList } selectedDomainName={ selectedDomainName }>
					{ translate( 'Email' ) }
				</Header>
			);
		}

		return null;
	}

	content() {
		const { domains, hasGSuiteUsersLoaded, hasSiteDomainsLoaded, selectedDomainName } = this.props;

		if ( ! hasGSuiteUsersLoaded || ! hasSiteDomainsLoaded ) {
			return <Placeholder />;
		}

		const domainList = selectedDomainName ? [ getSelectedDomain( this.props ) ] : domains;

		if ( domainList.some( hasGSuiteWithUs ) ) {
			return this.googleAppsUsersCard();
		}

		if ( config.isEnabled( 'email/titan-mvp' ) ) {
			const selectedDomain = domainList[ 0 ];
			return (
				<EmailProvidersComparison
					domain={ selectedDomain }
					isGSuiteSupported={ hasGSuiteSupportedDomain( [ selectedDomain ] ) }
				/>
			);
		}

		if ( hasGSuiteSupportedDomain( domainList ) ) {
			return this.addGSuiteCta();
		}

		const emailForwardingDomain = getEligibleEmailForwardingDomain( selectedDomainName, domains );

		if ( emailForwardingDomain && ! canUserPurchaseGSuite() && selectedDomainName ) {
			return this.addEmailForwardingCard( emailForwardingDomain );
		}

		return this.emptyContent();
	}

	emptyContent() {
		const { selectedSiteSlug, translate } = this.props;

		const defaultEmptyContentProps = {
			illustration: customDomainImage,
			action: translate( 'Add a custom domain' ),
			actionURL: '/domains/add/' + selectedSiteSlug,
		};

		const emptyContentProps = { ...defaultEmptyContentProps, ...this.getEmptyContentProps() };

		return <EmptyContent { ...emptyContentProps } />;
	}

	getEmptyContentProps() {
		const { selectedDomainName, selectedSiteSlug, translate } = this.props;

		const selectedDomain = getSelectedDomain( this.props );

		if ( selectedDomain && hasGSuiteWithAnotherProvider( selectedDomain ) ) {
			return {
				title: translate( 'G Suite is not supported on this domain' ),
				line: translate(
					"You're using G Suite with this domain, so you'll use that to create custom email addresses. Visit your G Suite provider to manage your settings."
				),
			};
		}

		const emailForwardingAction = {
			secondaryAction: translate( 'Add email forwarding' ),
			secondaryActionURL: emailManagementForwarding( selectedSiteSlug, selectedDomainName ),
		};

		if (
			selectedDomain &&
			isMappedDomain( selectedDomain ) &&
			! isMappedDomainWithWpcomNameservers( selectedDomain )
		) {
			return {
				title: translate( 'Use the powerful features of G Suite on this domain' ),
				line: translate(
					'To enable G Suite on %(domain)s, please configure it to use WordPress.com name servers.',
					{ args: { domain: selectedDomainName } }
				),
				action: translate( 'How to change your name servers' ),
				actionURL: localizeUrl(
					'https://wordpress.com/support/domains/map-existing-domain/#change-your-domains-name-servers'
				),
				actionTarget: '_blank',
				...emailForwardingAction,
			};
		}

		if ( selectedDomainName ) {
			return {
				title: translate( 'G Suite is not supported on this domain' ),
				line: translate( 'Only domains registered with WordPress.com are eligible for G Suite.' ),
				...emailForwardingAction,
			};
		}

		return {
			title: translate( 'Enable powerful email features.' ),
			line: translate(
				'To set up email forwarding, G Suite, and other email ' +
					'services for your site, upgrade your site’s web address ' +
					'to a professional custom domain.'
			),
		};
	}

	googleAppsUsersCard() {
		const { domains, gsuiteUsers, selectedDomainName } = this.props;

		return (
			<GSuiteUsersCard
				domains={ domains }
				gsuiteUsers={ gsuiteUsers }
				selectedDomainName={ selectedDomainName }
			/>
		);
	}

	addGSuiteCta() {
		const { domains, selectedDomainName } = this.props;
		const emailForwardingDomain = getEligibleEmailForwardingDomain( selectedDomainName, domains );
		const gsuiteDomainName = getEligibleGSuiteDomain( selectedDomainName, domains );

		return (
			<Fragment>
				<GSuitePurchaseCta domainName={ gsuiteDomainName } />

				{ emailForwardingDomain && this.addEmailForwardingCard( emailForwardingDomain ) }
			</Fragment>
		);
	}

	addEmailForwardingCard( domain ) {
		const { selectedSiteSlug, currentRoute, trackEmailForwardingClick, translate } = this.props;

		return (
			<VerticalNav>
				<VerticalNavItem
					onClick={ trackEmailForwardingClick }
					path={ emailManagementForwarding( selectedSiteSlug, domain, currentRoute ) }
				>
					{ translate( 'Email Forwarding' ) }
				</VerticalNavItem>
			</VerticalNav>
		);
	}

	goToEditOrList = () => {
		const { selectedDomainName, selectedSiteSlug, currentRoute } = this.props;

		if ( selectedDomainName ) {
			page( domainManagementEdit( selectedSiteSlug, selectedDomainName, currentRoute ) );
		} else {
			page( domainManagementList( selectedSiteSlug ) );
		}
	};
}

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			currentRoute: getCurrentRoute( state ),
			canManageSite: canCurrentUser( state, selectedSiteId, 'manage_options' ),
			domains: getDomainsBySiteId( state, selectedSiteId ),
			gsuiteUsers: getGSuiteUsers( state, selectedSiteId ),
			hasGSuiteUsersLoaded: hasLoadedGSuiteUsers( state, selectedSiteId ),
			hasSiteDomainsLoaded: hasLoadedSiteDomains( state, selectedSiteId ),
			selectedSiteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	( dispatch ) => {
		return {
			trackEmailForwardingClick: () =>
				dispatch( recordTracksEvent( 'calypso_email_email_forwarding_click' ) ),
		};
	}
)( localize( EmailManagement ) );
