/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Header from 'my-sites/domains/domain-management/components/header';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import AddGoogleAppsCard from './add-google-apps-card';
import GoogleAppsUsersCard from './google-apps-users-card';
import Placeholder from './placeholder';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import UpgradesNavigation from 'my-sites/domains/navigation';
import EmptyContent from 'components/empty-content';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementEmailForwarding,
} from 'my-sites/domains/paths';
import { hasGoogleApps, hasGoogleAppsSupportedDomain, getSelectedDomain } from 'lib/domains';
import { isPlanFeaturesEnabled } from 'lib/plans';
import EmailVerificationGate from 'components/email-verification/email-verification-gate';

class Email extends React.Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		googleAppsUsers: PropTypes.array.isRequired,
		googleAppsUsersLoaded: PropTypes.bool.isRequired,
		isRequestingSiteDomains: PropTypes.bool.isRequired,
		products: PropTypes.object,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		user: PropTypes.object.isRequired,
	};

	render() {
		return (
			<Main className="domain-management-email" wideLayout={ isPlanFeaturesEnabled() }>
				<SidebarNavigation />
				{ this.headerOrUpgradesNavigation() }
				{ this.content() }
			</Main>
		);
	}

	headerOrUpgradesNavigation() {
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
		return (
			<UpgradesNavigation
				path={ this.props.context.path }
				cart={ this.props.cart }
				selectedSite={ this.props.selectedSite }
			/>
		);
	}

	content() {
		if (
			! (
				! this.props.isRequestingSiteDomains &&
				this.props.googleAppsUsersLoaded &&
				get( this.props, 'products.gapps', false )
			)
		) {
			return <Placeholder />;
		}

		const domainList = this.props.selectedDomainName
			? [ getSelectedDomain( this.props ) ]
			: this.props.domains;

		if ( domainList.some( hasGoogleApps ) ) {
			return this.googleAppsUsersCard();
		} else if ( hasGoogleAppsSupportedDomain( domainList ) ) {
			return this.addGoogleAppsCard();
		}
		return this.emptyContent();
	}

	emptyContent() {
		const { selectedSite, selectedDomainName, translate } = this.props;
		let emptyContentProps;

		if ( selectedDomainName ) {
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
			illustration: '/calypso/images/illustrations/customDomain.svg',
			action: translate( 'Add a Custom Domain' ),
			actionURL: '/domains/add/' + this.props.selectedSite.slug,
		} );

		return <EmptyContent { ...emptyContentProps } />;
	}

	googleAppsUsersCard() {
		return <GoogleAppsUsersCard { ...this.props } />;
	}

	addGoogleAppsCard() {
		return (
			<div>
				<EmailVerificationGate
					noticeText={ this.props.translate( 'You must verify your email to purchase G Suite.' ) }
					noticeStatus="is-info"
				>
					<AddGoogleAppsCard { ...this.props } />
				</EmailVerificationGate>
				{ this.props.selectedDomainName && (
					<VerticalNav>
						<VerticalNavItem
							path={ domainManagementEmailForwarding(
								this.props.selectedSite.slug,
								this.props.selectedDomainName
							) }
						>
							{ this.props.translate( 'Email Forwarding' ) }
						</VerticalNavItem>
					</VerticalNav>
				) }
			</div>
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

export default localize( Email );
