/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { find, get, groupBy } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { CALYPSO_CONTACT } from 'lib/url/support';
import CompactCard from 'components/card/compact';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { emailManagementAddGSuiteUsers } from 'my-sites/email/paths';
import { getSelectedDomain, hasPendingGoogleAppsUsers } from 'lib/domains';
import GoogleAppsUserItem from './google-apps-user-item';
import Notice from 'components/notice';
import PendingGappsTosNotice from 'my-sites/domains/components/domain-warnings/pending-gapps-tos-notice';
import SectionHeader from 'components/section-header';

class GoogleAppsUsers extends React.Component {
	getDomainsAsList() {
		return this.props.selectedDomainName ? [ getSelectedDomain( this.props ) ] : this.props.domains;
	}

	canAddUsers( domainName ) {
		return this.getDomainsAsList().some(
			domain =>
				domain &&
				domain.name === domainName &&
				get( domain, 'googleAppsSubscription.ownedByUserId' ) === this.props.user.ID
		);
	}

	isNewUser( user, subscribedDate ) {
		return this.props
			.moment()
			.subtract( 1, 'day' )
			.isBefore( subscribedDate );
	}

	generateClickHandler( user ) {
		return () => {
			this.props.manageClick( this.props.selectedDomainName, user );
		};
	}

	goToAddGoogleApps = () => {
		this.props.addGoogleAppsUserClick( this.props.selectedDomainName );
	};

	renderDomain( domain, users ) {
		return (
			<div key={ `google-apps-user-${ domain }` } className="email__google-apps-users-card">
				<SectionHeader label={ domain }>
					{ this.canAddUsers( domain ) && (
						<Button
							primary
							compact
							href={ emailManagementAddGSuiteUsers( this.props.selectedSite.slug, domain ) }
							onClick={ this.goToAddGoogleApps }
						>
							{ this.props.translate( 'Add G Suite User' ) }
						</Button>
					) }
				</SectionHeader>
				<CompactCard className="email__google-apps-users-card-user-list">
					<ul className="email__google-apps-users-card-user-list-inner">
						{ users.map( ( user, index ) => this.renderUser( user, index ) ) }
					</ul>
				</CompactCard>
			</div>
		);
	}

	renderUser( user, index ) {
		if ( user.error ) {
			let status = 'is-warning',
				text = user.error,
				supportLink = (
					<a href={ CALYPSO_CONTACT }>
						<strong>{ this.props.translate( 'Please contact support' ) }</strong>
					</a>
				);

			const domain = find( this.props.domains, { name: user.domain } );
			const subscribedDate = get( domain, 'googleAppsSubscription.subscribedDate', false );
			if ( subscribedDate ) {
				if ( this.isNewUser( user, subscribedDate ) ) {
					status = null;
					text = this.props.translate(
						'We are setting up %(email)s for you. It should start working immediately, but may take up to 24 hours.',
						{ args: { email: user.email } }
					);
					supportLink = null;
				}
			}

			return (
				<Notice
					key={ `google-apps-user-notice-${ user.domain }-${ index }` }
					showDismiss={ false }
					status={ status }
				>
					{ text } { supportLink }
				</Notice>
			);
		}

		return (
			<GoogleAppsUserItem
				key={ `google-apps-user-${ user.domain }-${ index }` }
				user={ user }
				onClick={ this.generateClickHandler( user ) }
			/>
		);
	}

	render() {
		const pendingDomains = this.getDomainsAsList().filter( hasPendingGoogleAppsUsers );
		const usersByDomain = groupBy( this.props.googleAppsUsers, 'domain' );

		return (
			<div>
				{ pendingDomains.length !== 0 && (
					<PendingGappsTosNotice
						key="pending-gapps-tos-notice"
						siteSlug={ this.props.selectedSite.slug }
						domains={ pendingDomains }
						section="google-apps"
					/>
				) }

				{ Object.keys( usersByDomain ).map( domain =>
					this.renderDomain( domain, usersByDomain[ domain ] )
				) }
			</div>
		);
	}
}

const addGoogleAppsUserClick = domainName =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Add G Suite User" Button in G Suite',
			'Domain Name',
			domainName
		),

		recordTracksEvent( 'calypso_domain_management_gsuite_add_gsuite_user_click', {
			domain_name: domainName,
		} )
	);

const manageClick = ( domainName, email ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Manage" link in G Suite',
			'User Email',
			email
		),

		recordTracksEvent( 'calypso_domain_management_gsuite_manage_click', {
			domain_name: domainName,
			email,
		} )
	);

GoogleAppsUsers.propTypes = {
	domains: PropTypes.array.isRequired,
	googleAppsUsers: PropTypes.array.isRequired,
	selectedDomainName: PropTypes.string,
	selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	user: PropTypes.object.isRequired,
};

export default connect(
	null,
	{ addGoogleAppsUserClick, manageClick }
)( localize( GoogleAppsUsers ) );
