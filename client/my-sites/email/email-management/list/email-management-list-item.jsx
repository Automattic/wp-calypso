/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Badge from 'calypso/components/badge';
import { Button, CompactCard } from '@automattic/components';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { domainManagementEmailForwarding } from 'calypso/my-sites/domains/paths';
import emailForwardingIcon from 'calypso/assets/images/email-providers/forwarding.svg';
import {
	emailManagementAddGSuiteUsers,
	emailManagementNewTitanAccount,
} from 'calypso/my-sites/email/paths';
import FoldableCard from 'calypso/components/foldable-card';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getEmailForwards } from 'calypso/state/selectors/get-email-forwards';
import { getEmailForwardsCount, hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import {
	getGoogleMailServiceFamily,
	getGSuiteMailboxCount,
	getGSuiteOwnerId,
	hasGSuiteWithUs,
} from 'calypso/lib/gsuite';
import {
	getMaxTitanMailboxCount,
	getTitanMailOwnerId,
	getTitanProductName,
	hasTitanMailWithUs,
} from 'calypso/lib/titan';
import getGSuiteUsers from 'calypso/state/selectors/get-gsuite-users';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import Gridicon from 'calypso/components/gridicon';
import hasLoadedGSuiteUsers from 'calypso/state/selectors/has-loaded-gsuite-users';
import MaterialIcon from 'calypso/components/material-icon';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

class EmailManagementListItem extends React.Component {
	static propTypes = {
		currentRoute: PropTypes.string.isRequired,
		domain: PropTypes.object.isRequired,
		emails: PropTypes.array.isRequired,
		selectedSite: PropTypes.object.isRequired,
		user: PropTypes.object.isRequired,
		userCanManageOptions: PropTypes.bool.isRequired,
	};

	onAddTitanMailbox = () => {
		this.recordAddEmailEvent( 'titan' );

		const { currentRoute, domain, selectedSite } = this.props;
		page( emailManagementNewTitanAccount( selectedSite.slug, domain.name, currentRoute ) );
	};

	onAddGoogleUser = () => {
		this.recordAddEmailEvent( 'google' );

		const { currentRoute, domain, selectedSite } = this.props;
		page( emailManagementAddGSuiteUsers( selectedSite.slug, domain.name, currentRoute ) );
	};

	onAddEmailForward = () => {
		this.recordAddEmailEvent( 'email-forward' );

		const { domain, selectedSite } = this.props;
		page( domainManagementEmailForwarding( selectedSite.slug, domain.name ) );
	};

	recordAddEmailEvent( accountType ) {
		const { domain } = this.props;
		recordTracksEvent( 'calypso_email_management_add_email_account', {
			domain: domain.name,
			account_type: accountType,
		} );
	}

	canUserAddEmailAccounts( domain ) {
		const { user } = this.props;

		if ( hasTitanMailWithUs( domain ) ) {
			// TODO: Remove this check once the back end support for this is in place.
			const titanOwnerId = getTitanMailOwnerId( domain );
			if ( titanOwnerId === null ) {
				return true;
			}
			return titanOwnerId === user.ID;
		}

		if ( hasGSuiteWithUs( domain ) ) {
			return getGSuiteOwnerId( domain ) === user.ID;
		}

		if ( hasEmailForwards( domain ) ) {
			/* TODO: Update the logic */
			return this.props.userCanManageOptions;
		}

		return false;
	}

	getHeaderImage( domain ) {
		const { translate } = this.props;

		if ( hasTitanMailWithUs( domain ) ) {
			return (
				<Gridicon
					className="email-management-list-item__header-icon titan"
					icon="my-sites"
					size={ 36 }
				/>
			);
		}

		if ( hasGSuiteWithUs( domain ) ) {
			return (
				<img
					className="email-management-list-item__header-icon google"
					src={ googleWorkspaceIcon }
					alt={ translate( 'Google Workspace icon' ) }
				/>
			);
		}

		if ( hasEmailForwards( domain ) ) {
			return (
				<img
					className="email-management-list-item__header-icon email-forward"
					src={ emailForwardingIcon }
					alt={ translate( 'Email Forwarding icon' ) }
				/>
			);
		}

		return null;
	}

	getAddEmailHandler( domain ) {
		if ( hasTitanMailWithUs( domain ) ) {
			return this.onAddTitanMailbox;
		}

		if ( hasGSuiteWithUs( domain ) ) {
			return this.onAddGoogleUser;
		}

		if ( hasEmailForwards( domain ) ) {
			return this.onAddEmailForward;
		}

		return null;
	}

	getEmailProductName( domain ) {
		if ( hasTitanMailWithUs( domain ) ) {
			return getTitanProductName();
		}

		if ( hasGSuiteWithUs( domain ) ) {
			return domain.productName ?? getGoogleMailServiceFamily();
		}

		if ( hasEmailForwards( domain ) ) {
			return this.props.translate( 'Email Forwarding' );
		}

		return null;
	}

	getMailboxCount( domain ) {
		if ( hasTitanMailWithUs( domain ) ) {
			return getMaxTitanMailboxCount( domain );
		}

		if ( hasGSuiteWithUs( domain ) ) {
			return getGSuiteMailboxCount( domain );
		}

		if ( hasEmailForwards( domain ) ) {
			return getEmailForwardsCount( domain );
		}

		return 0;
	}

	renderFoldableContent() {
		const { domain, translate } = this.props;

		const addEmailHandler = this.getAddEmailHandler( domain );
		const wrappedAddEmailHandler = ( event ) => {
			event.preventDefault();
			addEmailHandler();
		};

		return (
			<React.Fragment>
				{ this.renderEmails() }
				{ this.canUserAddEmailAccounts( domain ) && (
					<VerticalNavItem path="#" onClick={ wrappedAddEmailHandler }>
						{ translate( 'Add new mailbox' ) }
					</VerticalNavItem>
				) }
			</React.Fragment>
		);
	}

	renderEmails() {
		const { domain, emails, hasGSuiteUsersLoaded } = this.props;

		if ( hasGSuiteWithUs( domain ) && ! hasGSuiteUsersLoaded ) {
			return (
				<CompactCard className="email-management-list-item__foldable-content is-placeholder" />
			);
		}

		if ( emails.length === 0 ) {
			return null;
		}

		return (
			<React.Fragment>
				{ emails.map( ( email ) => this.renderEmailAddress( email ) ) }
			</React.Fragment>
		);
	}

	renderEmailAddress( emailDetails ) {
		const { translate } = this.props;

		return (
			<CompactCard
				className="email-management-list-item__foldable-content-email-item"
				key={ `email-address-${ emailDetails.email }` }
			>
				<MaterialIcon icon="email" />
				<span className="email-management-list-item__foldable-content-email-address">
					{ emailDetails.email }
				</span>
				{ emailDetails.isAdmin && <Badge type="info">{ translate( 'Admin' ) }</Badge> }
			</CompactCard>
		);
	}

	render() {
		const { domain, translate } = this.props;

		const addEmailButton = null && this.canUserAddEmailAccounts( domain ) && (
			<Button onClick={ this.getAddEmailHandler( domain ) } compact primary>
				{ translate( 'Add email user' ) }
			</Button>
		);

		const numberOfMailboxes = this.getMailboxCount( domain );
		const mailboxCountText = numberOfMailboxes
			? '- ' +
			  translate( '%(numberOfMailboxes)d mailbox', '%(numberOfMailboxes)d mailboxes', {
					count: numberOfMailboxes,
					args: {
						numberOfMailboxes,
					},
			  } )
			: null;

		const header = (
			<React.Fragment>
				{ this.getHeaderImage( domain ) }

				<span className="email-management-list-item__header-text">
					<strong>{ domain.name }</strong>
					<span>
						{ this.getEmailProductName( domain ) } { mailboxCountText }
					</span>
				</span>
			</React.Fragment>
		);

		return (
			<React.Fragment>
				{ hasEmailForwards( domain ) && <QueryEmailForwards domainName={ domain.name } /> }

				<FoldableCard
					header={ header }
					summary={ addEmailButton }
					expandedSummary={ addEmailButton }
				>
					{ this.renderFoldableContent() }
				</FoldableCard>
			</React.Fragment>
		);
	}
}

const normalizeGsuiteUsers = ( gsuiteUsers ) => {
	if ( ! gsuiteUsers || ! Array.isArray( gsuiteUsers ) ) {
		return [];
	}
	return gsuiteUsers.map( ( gsuiteUser ) => {
		return {
			email: gsuiteUser.email,
			isAdmin: gsuiteUser.is_admin,
		};
	} );
};

const normalizeEmailForwardingAddresses = ( emailForwards ) => {
	if ( ! emailForwards || ! Array.isArray( emailForwards ) ) {
		return [];
	}
	return emailForwards.map( ( emailForward ) => {
		return {
			email: emailForward.email,
			isAdmin: false,
		};
	} );
};

function getGSuiteUsersForDomain( gsuiteUsersForSite, domainName ) {
	return gsuiteUsersForSite.filter( ( gsuiteUser ) => domainName === gsuiteUser.domain );
}

export default connect( ( state, ownProps ) => {
	const selectedSiteId = ownProps?.selectedSite?.ID;

	let emails = [];
	if ( hasGSuiteWithUs( ownProps.domain ) ) {
		const gsuiteUsersForSite = ! hasGSuiteWithUs( ownProps.domain )
			? []
			: getGSuiteUsers( state, selectedSiteId ) ?? [];
		const gsuiteUsers = getGSuiteUsersForDomain( gsuiteUsersForSite, ownProps.domain?.name );

		emails = normalizeGsuiteUsers( gsuiteUsers );
	} else if ( hasEmailForwards( ownProps.domain ) ) {
		const emailForwards = getEmailForwards( state, ownProps.domain?.name ) ?? [];
		emails = normalizeEmailForwardingAddresses( emailForwards );
	}

	return {
		currentRoute: getCurrentRoute( state ),
		emails,
		hasGSuiteUsersLoaded: hasLoadedGSuiteUsers( state, selectedSiteId ),
		user: getCurrentUser( state ),
		userCanManageOptions: canCurrentUser( state, selectedSiteId, 'manage_options' ),
	};
} )( localize( EmailManagementListItem ) );
