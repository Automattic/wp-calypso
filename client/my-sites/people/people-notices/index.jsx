/**
 * External dependencies
 */
var React = require( 'react' ),
	i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var PeopleLog = require( 'lib/people/log-store' ),
	PeopleActions = require( 'lib/people/actions' ),
	Notice = require( 'components/notice' );

let isSameSite = ( siteId, log ) => siteId && log.siteId && log.siteId === siteId;

let isSameUser = ( userId, log ) => userId && log.user && log.user.ID === userId;

let translateArg = ( log ) => {
	return { user: 'string' === typeof log.user ? log.user : log.user.login }
};

let filterBy = ( siteId, userId, log ) => {
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

module.exports = React.createClass( {

	displayName: 'PeopleNotices',

	getInitialState() {
		return this.getState();
	},

	componentDidMount() {
		PeopleLog.on( 'change', this.refreshNotices );
	},

	componentWillUnmount() {
		PeopleLog.removeListener( 'change', this.refreshNotices );
	},

	getState() {
		let siteId = this.props.siteId,
			userId = this.props.user && this.props.user.ID;
		return {
			errors: PeopleLog.getErrors( filterBy.bind( this, siteId, userId ) ),
			inProgress: PeopleLog.getInProgress( filterBy.bind( this, siteId, userId ) ),
			completed: PeopleLog.getCompleted( filterBy.bind( this, siteId, userId ) )
		};
	},

	refreshNotices() {
		this.setState( this.getState() );
	},

	inProgressMessage() {
		let log = this.state.inProgress[0];
		switch ( log.action ) {
			case 'UPDATE_SITE_USER':
				return i18n.translate( 'Updating @%(user)s', { args: translateArg( log ), context: 'In progress message while a site is performing actions on users.' } );
			case 'DELETE_SITE_USER':
				return i18n.translate( 'Deleting @%(user)s', { args: translateArg( log ), context: 'In progress message while a site is performing actions on users.' } );
		}
	},

	errorMessage() {
		let log = this.state.errors[ this.state.errors.length - 1 ];
		switch ( log.action ) {
			case 'RECEIVE_UPDATE_SITE_USER_FAILURE':
				// Generic update error. Use `localStorage.setItem( 'debug', 'calypso:users:actions' ) for a more detailed error.
				return i18n.translate( 'There was an error updating @%(user)s', { args: translateArg( log ), context: 'Error message after A site has failed to perform actions on a user.' } );
			case 'RECEIVE_DELETE_SITE_USER_FAILURE':
				return i18n.translate( 'There was an error deleting @%(user)s', { args: translateArg( log ), context: 'Error message after A site has failed to perform actions on a user.' } );
			case 'RECEIVE_USERS':
				return i18n.translate( 'There was an error retrieving users' );
			case 'RECEIVE_FOLLOWERS':
				return i18n.translate( 'There was an error retrieving followers' );
			case 'RECEIVE_EMAIL_FOLLOWERS':
				return i18n.translate( 'There was an error retrieving email followers' );
			case 'RECEIVE_VIEWERS':
				return i18n.translate( 'There was an error retrieving viewers' );
		}
	},

	successMessage() {
		let log = this.state.completed[ this.state.completed.length - 1 ];
		switch ( log.action ) {
			case 'RECEIVE_UPDATE_SITE_USER_SUCCESS':
				return i18n.translate( 'Successfully updated @%(user)s', { args: translateArg( log ), context: 'Success message after a user has been modified.' } );
			case 'RECEIVE_DELETE_SITE_USER_SUCCESS':
				return i18n.translate( 'Successfully deleted @%(user)s', { args: translateArg( log ), context: 'Success message after a user has been modified.' } );
		}
	},

	render() {
		let logNotices = this.state,
			notice = null,
			message;

		if ( logNotices.inProgress.length > 0 ) {
			message = this.inProgressMessage();
			if ( message ) {
				notice = (
					<Notice showDismiss={ false } className="people-notice">
						{ message }
					</Notice>
				);
			}
		}
		if ( logNotices.errors.length > 0 ) {
			message = this.errorMessage();
			if ( message ) {
				notice = (
					<Notice status="is-error" className="people-notice" onDismissClick={ PeopleActions.removePeopleNotices.bind( this, logNotices.errors ) }>
						{ message }
					</Notice>
				);
			}
		} else if ( logNotices.completed.length > 0 ) {
			message = this.successMessage();
			if ( message ) {
				notice = (
					<Notice status="is-success" className="people-notice" onDismissClick={ PeopleActions.removePeopleNotices.bind( this, logNotices.completed ) }>
						{ message }
					</Notice>
				);
			}
		}

		return notice;
	},
} );
