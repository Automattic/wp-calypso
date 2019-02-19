/** @format */

/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { find, get, groupBy } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { CALYPSO_CONTACT } from 'lib/url/support';
import CompactCard from 'components/card/compact';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { emailManagementAddGSuiteUsers } from 'my-sites/email/paths';
import { getSelectedDomain, hasPendingGoogleAppsUsers } from 'lib/domains';
import GSuiteUserItem from './gsuite-user-item';
import Notice from 'components/notice';
import PendingGappsTosNotice from 'my-sites/domains/components/domain-warnings/pending-gapps-tos-notice';
import SectionHeader from 'components/section-header';

class GSuiteAppsUsers extends Component {
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

	goToAddGSuite = () => {
		this.props.addGSuiteUserClick( this.props.selectedDomainName );
	};

	renderDomain( domain, users ) {
		return (
			<div key={ `gsuite-user-${ domain }` } className="email-management__gsuite-users-card">
				{' '}
				{ /* eslint-disable-line wpcalypso/jsx-classname-namespace */ }
				<SectionHeader label={ domain }>
					{ this.canAddUsers( domain ) && (
						<Button
							primary
							compact
							href={ emailManagementAddGSuiteUsers( this.props.selectedSite.slug, domain ) }
							onClick={ this.goToAddGSuite }
						>
							{ this.props.translate( 'Add G Suite User' ) }
						</Button>
					) }
				</SectionHeader>
				<CompactCard className="email-management__gsuite-users-card-user-list">
					{' '}
					{ /* eslint-disable-line wpcalypso/jsx-classname-namespace */ }
					<ul className="email-management__gsuite-users-card-user-list-inner">
						{' '}
						{ /* eslint-disable-line wpcalypso/jsx-classname-namespace */ }
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
					key={ `gsuite-user-notice-${ user.domain }-${ index }` }
					showDismiss={ false }
					status={ status }
				>
					{ text } { supportLink }
				</Notice>
			);
		}

		return (
			<GSuiteUserItem
				key={ `gsuite-user-${ user.domain }-${ index }` }
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
						section="gsuite"
					/>
				) }

				{ Object.keys( usersByDomain ).map( domain =>
					this.renderDomain( domain, usersByDomain[ domain ] )
				) }
			</div>
		);
	}
}

const addGSuiteUserClick = domainName =>
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

GSuiteAppsUsers.propTypes = {
	domains: PropTypes.array.isRequired,
	googleAppsUsers: PropTypes.array.isRequired,
	selectedDomainName: PropTypes.string,
	selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	user: PropTypes.object.isRequired,
};

export default connect(
	null,
	{ addGSuiteUserClick, manageClick }
)( localize( GSuiteAppsUsers ) );
