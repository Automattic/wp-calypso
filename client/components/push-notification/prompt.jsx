/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import includes from 'lodash/includes';
import moment from 'moment';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import Button from 'components/button';
import observe from 'lib/mixins/data-observe';
import {
	dismissNotice,
	toggleEnabled,
} from 'state/push-notifications/actions';
import {
	getStatus,
	isApiReady,
	isAuthorizationLoaded,
	isAuthorized,
	isBlocked,
	isEnabled,
	isNoticeDismissed
} from 'state/push-notifications/selectors';

const SECTION_NAME_WHITELIST = [
	'discover',
	'menus',
	'people',
	'plans',
	'plugins',
	'posts-pages',
	'reader',
	'reader-activities',
	'reader-list',
	'reader-recomendations',
	'reader-search',
	'reader-tags',
	'settings',
	'sharing',
	'upgrades'
];

const NEW_USER_CUT_OFF_AGE_IN_DAYS = 7;

const PushNotificationPrompt = React.createClass( {
	displayName: 'PushNotificationPrompt',

	mixins: [ observe( 'user' ) ],

	propTypes: {
		user: React.PropTypes.object,
		section: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ),
		isLoading: React.PropTypes.bool
	},

	pushUnsubscribedNotice: function() {
		const buttonDisabled = includes( [ 'disabling', 'enabling', 'unknown' ], this.props.status );
		const noticeText = (
			<div>
				<p>
					<strong>{ this.translate( 'Get notifications on your desktop!' ) }</strong> { this.translate( 'Get instant notifications for new comments and likes, even when you are not actively using WordPress.com.' ) }
				</p>
				<p>
					{ this.translate(
						'{{enableButton}}Enable Browser Notifications{{/enableButton}}', {
							components: {
								enableButton: <Button className={ 'push-notification__prompt-enable' } disabled={ buttonDisabled } onClick={ this.props.toggleEnabled } />
							} }
					) }
				</p>
			</div>
		);

		return <Notice className="push-notification__notice" text={ noticeText } icon="bell" onDismissClick={ this.props.dismissNotice } />;
	},

	isNewUser: function( user ) {
		const userCreated = moment.utc( user.date );
		const now = moment().utc();

		return userCreated.isAfter( now.subtract( NEW_USER_CUT_OFF_AGE_IN_DAYS, 'days' ) );
	},

	render: function() {
		if (
			! this.props.isAuthorizationLoaded ||
			! this.props.isApiReady ||
			this.props.isBlocked ||
			this.props.isNoticeDismissed ||
			( this.props.isEnabled && this.props.isAuthorized )
		) {
			return null;
		}
		const user = this.props.user.get();

		if ( ! user || ! user.email_verified || this.isNewUser( user ) ) {
			return null;
		}

		if ( ! this.props.section || this.props.isLoading || -1 === SECTION_NAME_WHITELIST.indexOf( this.props.section.name ) ) {
			return null;
		}

		return this.pushUnsubscribedNotice();
	}
} );

export default connect(
	( state ) => {
		return {
			isApiReady: isApiReady( state ),
			isAuthorizationLoaded: isAuthorizationLoaded( state ),
			isAuthorized: isAuthorized( state ),
			isBlocked: isBlocked( state ),
			isEnabled: isEnabled( state ),
			isNoticeDismissed: isNoticeDismissed( state ),
			status: getStatus( state )
		};
	},
	{
		dismissNotice,
		toggleEnabled
	}
)( PushNotificationPrompt );
