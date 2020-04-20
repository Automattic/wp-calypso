/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PeopleLog from 'lib/people/log-store';
import PeopleActions from 'lib/people/actions';
import Notice from 'components/notice';
import { getSelectedSite } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const isSameSite = ( siteId, log ) => siteId && log.siteId && log.siteId === siteId;

const isSameUser = ( userId, log ) => userId && log.user && log.user.ID === userId;

const translateArg = ( log ) => {
	return { user: 'string' === typeof log.user ? log.user : log.user.login };
};

const filterBy = ( siteId, userId, log ) => {
	if ( ! siteId && ! userId ) {
		return true;
	}
	if ( isSameSite( siteId, log ) && isSameUser( userId, log ) ) {
		return true;
	} else if ( ! userId && isSameSite( siteId, log ) ) {
		return true;
	} else if ( ! siteId && isSameUser( userId, log ) ) {
		return true;
	}
	return false;
};

const isMultisite = ( site ) => {
	return site && site.is_multisite;
};

class PeopleNotices extends React.Component {
	static displayName = 'PeopleNotices';

	componentDidMount() {
		PeopleLog.on( 'change', this.refreshNotices );
	}

	componentWillUnmount() {
		PeopleLog.removeListener( 'change', this.refreshNotices );
	}

	getState = () => {
		const siteId = this.props.site ? this.props.site.ID : null;
		const userId = this.props.user ? this.props.user.ID : null;

		return {
			errors: PeopleLog.getErrors( filterBy.bind( this, siteId, userId ) ),
			inProgress: PeopleLog.getInProgress( filterBy.bind( this, siteId, userId ) ),
			completed: PeopleLog.getCompleted( filterBy.bind( this, siteId, userId ) ),
		};
	};

	refreshNotices = () => {
		this.setState( this.getState() );
	};

	inProgressMessage = () => {
		const log = this.state.inProgress[ 0 ];
		switch ( log.action ) {
			case 'UPDATE_SITE_USER':
				return i18n.translate( 'Updating @%(user)s', {
					args: translateArg( log ),
					context: 'In progress message while a site is performing actions on users.',
				} );
			case 'DELETE_SITE_USER':
				if ( isMultisite( this.props.site ) ) {
					return i18n.translate( 'Removing @%(user)s', {
						args: translateArg( log ),
						context: 'In progress message while a site is performing actions on users.',
					} );
				}

				return i18n.translate( 'Deleting @%(user)s', {
					args: translateArg( log ),
					context: 'In progress message while a site is performing actions on users.',
				} );
		}
	};

	errorMessage = () => {
		const log = this.state.errors[ this.state.errors.length - 1 ];
		switch ( log.action ) {
			case 'RECEIVE_UPDATE_SITE_USER_FAILURE':
				// Generic update error. Use `localStorage.setItem( 'debug', 'calypso:users:actions' ) for a more detailed error.
				return i18n.translate( 'There was an error updating @%(user)s', {
					args: translateArg( log ),
					context: 'Error message after A site has failed to perform actions on a user.',
				} );
			case 'RECEIVE_DELETE_SITE_USER_FAILURE':
				if ( 'user_owns_domain_subscription' === log.error.error ) {
					const numDomains = log.error.message.split( ',' ).length;
					return i18n.translate(
						'@%(user)s owns following domain used on this site: {{strong}}%(domains)s{{/strong}}. This domain will have to be transferred to a different site, transferred to a different registrar, or canceled before removing or deleting @%(user)s.',
						'@%(user)s owns following domains used on this site: {{strong}}%(domains)s{{/strong}}. These domains will have to be transferred to a different site, transferred to a different registrar, or canceled before removing or deleting @%(user)s.',
						{
							count: numDomains,
							args: {
								domains: log.error.message,
								...translateArg( log ),
							},
							components: {
								strong: <strong />,
							},
						}
					);
				}
				if ( isMultisite( this.props.site ) ) {
					return i18n.translate( 'There was an error removing @%(user)s', {
						args: translateArg( log ),
						context: 'Error message after A site has failed to perform actions on a user.',
					} );
				}
				return i18n.translate( 'There was an error deleting @%(user)s', {
					args: translateArg( log ),
					context: 'Error message after A site has failed to perform actions on a user.',
				} );
			case 'RECEIVE_USERS':
				return i18n.translate( 'There was an error retrieving users' );
			case 'RECEIVE_FOLLOWERS':
				return i18n.translate( 'There was an error retrieving followers' );
			case 'RECEIVE_EMAIL_FOLLOWERS':
				return i18n.translate( 'There was an error retrieving email followers' );
			case 'RECEIVE_VIEWERS':
				return i18n.translate( 'There was an error retrieving viewers' );
		}
	};

	successMessage = () => {
		const log = this.state.completed[ this.state.completed.length - 1 ];
		switch ( log.action ) {
			case 'RECEIVE_UPDATE_SITE_USER_SUCCESS':
				return i18n.translate( 'Successfully updated @%(user)s', {
					args: translateArg( log ),
					context: 'Success message after a user has been modified.',
				} );
			case 'RECEIVE_DELETE_SITE_USER_SUCCESS':
				if ( isMultisite( this.props.site ) ) {
					return i18n.translate( 'Successfully removed @%(user)s', {
						args: translateArg( log ),
						context: 'Success message after a user has been modified.',
					} );
				}
				return i18n.translate( 'Successfully deleted @%(user)s', {
					args: translateArg( log ),
					context: 'Success message after a user has been modified.',
				} );
		}
	};

	state = this.getState();

	render() {
		const logNotices = this.state,
			onDismissErrorNotice = () => {
				PeopleActions.removePeopleNotices( logNotices.errors );
			},
			onDismissSuccessNotice = () => {
				PeopleActions.removePeopleNotices( logNotices.completed );
			};

		let notice = null,
			message;

		if ( logNotices.inProgress.length > 0 ) {
			message = this.inProgressMessage();
			if ( message ) {
				notice = (
					<Notice showDismiss={ false } className="people-notices__notice">
						{ message }
					</Notice>
				);
			}
		}
		if ( logNotices.errors.length > 0 ) {
			message = this.errorMessage();
			if ( message ) {
				notice = (
					<Notice
						status="is-error"
						className="people-notices__notice"
						onDismissClick={ onDismissErrorNotice }
					>
						{ message }
					</Notice>
				);
			}
		} else if ( logNotices.completed.length > 0 ) {
			message = this.successMessage();
			if ( message ) {
				notice = (
					<Notice
						status="is-success"
						className="people-notices__notice"
						onDismissClick={ onDismissSuccessNotice }
					>
						{ message }
					</Notice>
				);
			}
		}

		return notice;
	}
}

export default connect( ( state ) => {
	return {
		site: getSelectedSite( state ),
	};
} )( PeopleNotices );
