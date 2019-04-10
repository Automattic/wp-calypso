/** @format */

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
import Main from 'components/main';
import Header from 'my-sites/domains/domain-management/components/header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import {
	hasGSuite,
	isGSuiteRestricted,
	hasGSuiteSupportedDomain,
	getEligibleGSuiteDomain,
} from 'lib/domains/gsuite';
import { getEligibleEmailForwardingDomain } from 'lib/domains/email-forwarding';
import getGSuiteUsers from 'state/selectors/get-gsuite-users';
import { getDecoratedSiteDomains, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import GSuitePurchaseCta from 'my-sites/email/gsuite-purchase-cta';
import GSuiteUsersCard from 'my-sites/email/email-management/gsuite-users-card';
import Placeholder from 'my-sites/email/email-management/gsuite-users-card/placeholder';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import PlansNavigation from 'my-sites/plans/navigation';
import EmptyContent from 'components/empty-content';
import { domainManagementEdit, domainManagementList } from 'my-sites/domains/paths';
import { emailManagement, emailManagementForwarding } from 'my-sites/email/paths';
import { getSelectedDomain } from 'lib/domains';
import { isPlanFeaturesEnabled } from 'lib/plans';
import DocumentHead from 'components/data/document-head';
import QueryGSuiteUsers from 'components/data/query-gsuite-users';
import QuerySiteDomains from 'components/data/query-site-domains';

/**
 * Style dependencies
 */
import './style.scss';

class EmailManagement extends React.Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		gsuiteUsers: PropTypes.array,
		isRequestingDomains: PropTypes.bool.isRequired,
		selectedSiteId: PropTypes.number.isRequired,
		selectedSiteSlug: PropTypes.string.isRequired,
		selectedDomainName: PropTypes.string,
	};

	render() {
		const { selectedSiteId } = this.props;
		return (
			<Main className="email-management" wideLayout={ isPlanFeaturesEnabled() }>
				{ selectedSiteId && <QueryGSuiteUsers siteId={ selectedSiteId } /> }
				{ selectedSiteId && <QuerySiteDomains siteId={ selectedSiteId } /> }
				<DocumentHead title={ this.props.translate( 'Email' ) } />
				<SidebarNavigation />
				{ this.headerOrPlansNavigation() }
				{ this.content() }
			</Main>
		);
	}

	headerOrPlansNavigation() {
		const { cart, selectedSiteSlug, selectedDomainName, translate } = this.props;
		if ( selectedDomainName ) {
			return (
				<Header onClick={ this.goToEditOrList } selectedDomainName={ selectedDomainName }>
					{ translate( 'Email' ) }
				</Header>
			);
		}
		return (
			<PlansNavigation
				cart={ cart }
				path={ emailManagement( selectedSiteSlug, selectedDomainName ) }
			/>
		);
	}

	content() {
		const { domains, gsuiteUsers, isRequestingDomains, selectedDomainName } = this.props;
		const emailForwardingDomain = getEligibleEmailForwardingDomain( selectedDomainName, domains );
		if ( isRequestingDomains || ! gsuiteUsers ) {
			return <Placeholder />;
		}
		const domainList = selectedDomainName ? [ getSelectedDomain( this.props ) ] : domains;

		if ( domainList.some( hasGSuite ) ) {
			return this.googleAppsUsersCard();
		} else if ( hasGSuiteSupportedDomain( domainList ) ) {
			return this.addGSuiteCta();
		} else if ( emailForwardingDomain && isGSuiteRestricted() && selectedDomainName ) {
			return this.addEmailForwardingCard( emailForwardingDomain );
		}
		return this.emptyContent();
	}

	emptyContent() {
		const { selectedDomainName, selectedSiteSlug, translate } = this.props;
		let emptyContentProps;

		if ( isGSuiteRestricted() && ! selectedDomainName ) {
			emptyContentProps = {
				title: translate( 'Enable powerful email features.' ),
				line: translate(
					'To set up email forwarding, and other email ' +
						'services for your site, upgrade your site’s web address ' +
						'to a professional custom domain.'
				),
			};
		} else if ( selectedDomainName ) {
			emptyContentProps = {
				title: translate( 'G Suite is not supported on this domain' ),
				line: translate( 'Only domains registered with WordPress.com are eligible for G Suite.' ),
				secondaryAction: translate( 'Add Email Forwarding' ),
				secondaryActionURL: emailManagementForwarding( selectedSiteSlug, selectedDomainName ),
			};
		} else {
			emptyContentProps = {
				title: translate( 'Enable powerful email features.' ),
				line: translate(
					'To set up email forwarding, G Suite, and other email ' +
						'services for your site, upgrade your site’s web address ' +
						'to a professional custom domain.'
				),
			};
		}
		Object.assign( emptyContentProps, {
			illustration: '/calypso/images/illustrations/custom-domain.svg',
			action: translate( 'Add a Custom Domain' ),
			actionURL: '/domains/add/' + selectedSiteSlug,
		} );

		return <EmptyContent { ...emptyContentProps } />;
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
		const { selectedSiteSlug, translate } = this.props;
		return (
			<VerticalNav>
				<VerticalNavItem path={ emailManagementForwarding( selectedSiteSlug, domain ) }>
					{ translate( 'Email Forwarding' ) }
				</VerticalNavItem>
			</VerticalNav>
		);
	}

	goToEditOrList = () => {
		const { selectedDomainName, selectedSiteSlug } = this.props;
		if ( selectedDomainName ) {
			page( domainManagementEdit( selectedSiteSlug, selectedDomainName ) );
		} else {
			page( domainManagementList( selectedSiteSlug ) );
		}
	};
}

export default connect(
	state => {
		const selectedSiteId = getSelectedSiteId( state );
		return {
			domains: getDecoratedSiteDomains( state, selectedSiteId ),
			gsuiteUsers: getGSuiteUsers( state, selectedSiteId ),
			isRequestingDomains: isRequestingSiteDomains( state, selectedSiteId ),
			selectedSiteId,
			selectedSiteSlug: getSelectedSiteSlug( state ),
		};
	},
	{}
)( localize( EmailManagement ) );
