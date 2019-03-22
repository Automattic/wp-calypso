/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { get } from 'lodash';
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
import { hasGSuite, isGSuiteRestricted, hasGSuiteSupportedDomain } from 'lib/domains/gsuite';
import { getEligibleEmailForwardingDomain } from 'lib/domains/email-forwarding';
import { getAnnualPrice, getMonthlyPrice } from 'lib/google-apps';
import getGSuiteUsers from 'state/selectors/get-gsuite-users';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import GSuitePurchaseCta from 'my-sites/email/gsuite-purchase-cta';
import GSuiteUsersCard from 'my-sites/email/email-management/gsuite-users-card';
import Placeholder from 'my-sites/email/email-management/gsuite-users-card/placeholder';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import PlansNavigation from 'my-sites/plans/navigation';
import EmptyContent from 'components/empty-content';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementEmailForwarding,
} from 'my-sites/domains/paths';
import { getSelectedDomain } from 'lib/domains';
import { isPlanFeaturesEnabled } from 'lib/plans';
import DocumentHead from 'components/data/document-head';
import QueryGSuiteUsers from 'components/data/query-gsuite-users';

/**
 * Style dependencies
 */
import './style.scss';

const gsuitePlanSlug = 'gapps'; // or gapps_unlimited - TODO make this dynamic

class EmailManagement extends React.Component {
	static propTypes = {
		currencyCode: PropTypes.string.isRequired,
		domains: PropTypes.array.isRequired,
		gsuiteUsers: PropTypes.array,
		isRequestingSiteDomains: PropTypes.bool.isRequired,
		products: PropTypes.object,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		user: PropTypes.object.isRequired,
	};

	render() {
		const { selectedSite } = this.props;
		return (
			<Main className="email-management" wideLayout={ isPlanFeaturesEnabled() }>
				{ selectedSite && <QueryGSuiteUsers siteId={ selectedSite.ID } /> }
				<DocumentHead title={ this.props.translate( 'Email' ) } />
				<SidebarNavigation />
				{ this.headerOrPlansNavigation() }
				{ this.content() }
			</Main>
		);
	}

	headerOrPlansNavigation() {
		if ( this.props.selectedDomainName ) {
			return (
				<Header
					onClick={ this.goToEditOrList }
					selectedDomainName={ this.props.selectedDomainName }
				>
					{ this.props.translate( 'Email' ) }
				</Header>
			);
		}
		return <PlansNavigation cart={ this.props.cart } path={ this.props.context.path } />;
	}

	content() {
		const { domains, selectedDomainName } = this.props;
		const emailForwardingDomain = getEligibleEmailForwardingDomain( selectedDomainName, domains );
		if (
			! (
				! this.props.isRequestingSiteDomains &&
				null !== this.props.gsuiteUsers &&
				get( this.props, [ 'products', gsuitePlanSlug ], false )
			)
		) {
			return <Placeholder />;
		}
		const domainList = selectedDomainName ? [ getSelectedDomain( this.props ) ] : domains;

		if ( domainList.some( hasGSuite ) ) {
			return this.googleAppsUsersCard();
		} else if ( hasGSuiteSupportedDomain( domainList ) ) {
			return this.addGoogleAppsCard();
		} else if ( emailForwardingDomain && isGSuiteRestricted() && selectedDomainName ) {
			return this.addEmailForwardingCard( emailForwardingDomain );
		}
		return this.emptyContent();
	}

	emptyContent() {
		const { selectedSite, selectedDomainName, translate } = this.props;
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
				secondaryActionURL: domainManagementEmailForwarding(
					selectedSite.slug,
					selectedDomainName
				),
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
			actionURL: '/domains/add/' + this.props.selectedSite.slug,
		} );

		return <EmptyContent { ...emptyContentProps } />;
	}

	googleAppsUsersCard() {
		const { domains, gsuiteUsers, selectedDomainName, selectedSite, user } = this.props;
		return (
			<GSuiteUsersCard
				domains={ domains }
				gsuiteUsers={ gsuiteUsers }
				selectedDomainName={ selectedDomainName }
				selectedSite={ selectedSite }
				user={ user }
			/>
		);
	}

	addGoogleAppsCard() {
		const { currencyCode, domains, products, selectedDomainName, selectedSite } = this.props;
		const emailForwardingDomain = getEligibleEmailForwardingDomain( selectedDomainName, domains );
		const price = get( products, [ gsuitePlanSlug, 'prices', currencyCode ], 0 );
		const annualPrice = getAnnualPrice( price, currencyCode );
		const monthlyPrice = getMonthlyPrice( price, currencyCode );
		return (
			<Fragment>
				<GSuitePurchaseCta
					annualPrice={ annualPrice }
					monthlyPrice={ monthlyPrice }
					productSlug={ gsuitePlanSlug }
					selectedDomainName={ selectedDomainName }
					selectedSite={ selectedSite }
				/>
				{ emailForwardingDomain && this.addEmailForwardingCard( emailForwardingDomain ) }
			</Fragment>
		);
	}

	addEmailForwardingCard( domain ) {
		const { selectedSite, translate } = this.props;
		return (
			<VerticalNav>
				<VerticalNavItem path={ domainManagementEmailForwarding( selectedSite.slug, domain ) }>
					{ translate( 'Email Forwarding' ) }
				</VerticalNavItem>
			</VerticalNav>
		);
	}

	goToEditOrList = () => {
		if ( this.props.selectedDomainName ) {
			page( domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
		} else {
			page( domainManagementList( this.props.selectedSite.slug ) );
		}
	};
}

export default connect(
	state => {
		const selectedSite = getSelectedSite( state );
		const siteId = get( selectedSite, 'ID', null );
		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			gsuiteUsers: getGSuiteUsers( state, siteId ),
			selectedSite,
		};
	},
	{}
)( localize( EmailManagement ) );
