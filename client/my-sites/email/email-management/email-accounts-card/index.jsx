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
import { Button, CompactCard } from '@automattic/components';
import { CALYPSO_CONTACT } from 'lib/url/support';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { emailManagementAddGSuiteUsers } from 'my-sites/email/paths';
import EmailAccountItem from 'my-sites/email/email-management/email-account-item';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedDomain } from 'lib/domains';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import Notice from 'components/notice';
import SectionHeader from 'components/section-header';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class EmailAccountsCard extends React.Component {
	getDomainsAsList() {
		return this.props.selectedDomainName ? [ getSelectedDomain( this.props ) ] : this.props.domains;
	}

	isNewUser( user, subscribedDate ) {
		return this.props.moment().subtract( 1, 'day' ).isBefore( subscribedDate );
	}

	generateClickHandler( user ) {
		return () => {
			this.props.manageClick( user.domain, user.email );
		};
	}

	goToAddGoogleApps = () => {
		this.props.addGoogleAppsUserClick( this.props.selectedDomainName );
	};

	renderDomain( domainName, account ) {
		const { selectedSiteSlug, translate } = this.props;

		// This ensures display consistency if the API is not ready yet
		const label = account.productName ? `${ account.productName }: ${ domainName }` : domainName;
		return (
			<div key={ `email-account-${ domainName }` } className="email-accounts-card__container">
				<SectionHeader label={ label }>
					<Button
						primary
						compact
						href={ emailManagementAddGSuiteUsers( selectedSiteSlug, domainName ) }
						onClick={ this.goToAddGoogleApps }
					>
						{ translate( 'Add New User' ) }
					</Button>
				</SectionHeader>
				<CompactCard className="email-accounts-card__user-list">
					<ul className="email-accounts-card__user-list-inner">
						{ account.mailboxes.map( ( mailbox, index ) =>
							this.renderMailbox( account, mailbox, index )
						) }
					</ul>
				</CompactCard>
			</div>
		);
	}

	renderMailbox( account, mailbox, index ) {
		const { domains, selectedSiteSlug, translate } = this.props;

		if ( account.error ) {
			let status = 'is-warning',
				text = account.error,
				supportLink = (
					<a href={ CALYPSO_CONTACT }>
						<strong>{ translate( 'Please contact support' ) }</strong>
					</a>
				);

			const domainName = find( domains, { name: mailbox.domainName } );
			const subscribedDate = get( domainName, 'googleAppsSubscription.subscribedDate', false );
			if ( subscribedDate ) {
				if ( this.isNewUser( mailbox, subscribedDate ) ) {
					status = null;
					text = translate(
						'We are setting up %(email)s for you. It should start working immediately, but may take up to 24 hours.',
						{ args: { email: `${ mailbox.name }@${ account.domainName }` } }
					);
					supportLink = null;
				}
			}

			return (
				<Notice
					key={ `google-apps-user-notice-${ account.domainName }-${ index }` }
					showDismiss={ false }
					status={ status }
				>
					{ text } { supportLink }
				</Notice>
			);
		}

		return (
			<EmailAccountItem
				key={ `email-account-${ mailbox.domainName }-${ index }` }
				mailbox={ mailbox }
				account={ account }
				onClick={ this.generateClickHandler( mailbox ) }
				siteSlug={ selectedSiteSlug }
			/>
		);
	}

	renderType( accounts ) {
		const { selectedDomainName } = this.props;
		const emailAccountsByDomain = groupBy( accounts, 'domainName' );

		return Object.keys( emailAccountsByDomain )
			.filter( ( domainName ) => ! selectedDomainName || domainName === selectedDomainName )
			.map( ( domainName ) =>
				this.renderDomain( domainName, emailAccountsByDomain[ domainName ][ 0 ] )
			);
	}

	render() {
		const { emailAccounts } = this.props;
		const emailAccountsByType = groupBy( emailAccounts, 'productType' );

		return (
			<div>
				{ Object.values( emailAccountsByType ).map( ( accounts ) => this.renderType( accounts ) ) }
			</div>
		);
	}
}

const addGoogleAppsUserClick = ( domainName ) =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Add New User" Button in G Suite',
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

EmailAccountsCard.propTypes = {
	domains: PropTypes.array.isRequired,
	emailAccounts: PropTypes.array.isRequired,
	selectedDomainName: PropTypes.string,
	selectedSiteSlug: PropTypes.string.isRequired,
	user: PropTypes.object.isRequired,
};

export default connect(
	( state ) => ( {
		selectedSiteSlug: getSelectedSiteSlug( state ),
		user: getCurrentUser( state ),
	} ),
	{ addGoogleAppsUserClick, manageClick }
)( localize( withLocalizedMoment( EmailAccountsCard ) ) );
