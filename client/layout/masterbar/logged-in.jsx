/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'state/analytics/actions';
import Masterbar from './masterbar';
import Item from './item';
import Notifications from './notifications';
import Gravatar from 'components/gravatar';
import config from 'config';
import { preload } from 'sections-helper';
import { isNotificationsOpen } from 'state/selectors';
import { setNextLayoutFocus } from 'state/ui/layout-focus/actions';

class MasterbarLoggedIn extends React.Component {
	static propTypes = {
		domainOnlySite: PropTypes.bool,
		user: PropTypes.object,
		section: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		setNextLayoutFocus: PropTypes.func.isRequired,
		siteSlug: PropTypes.string,
	};

	clickReader = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_reader_clicked' );
		this.props.setNextLayoutFocus( 'content' );
	};

	clickMe = () => {
		this.props.recordTracksEvent( 'calypso_masterbar_me_clicked' );
	};

	preloadReader = () => {
		preload( 'reader' );
	};

	preloadMe = () => {
		preload( 'me' );
	};

	isActive = section => {
		return section === this.props.section && ! this.props.isNotificationsShowing;
	};

	wordpressIcon = () => {
		// WP icon replacement for "horizon" environment
		if ( config( 'hostname' ) === 'horizon.wordpress.com' ) {
			return 'my-sites-horizon';
		}

		return 'my-sites';
	};

	render() {
		const { translate } = this.props;

		return (
			<Masterbar>
				<Item
					tipTarget="reader"
					className="masterbar__reader"
					url="/"
					icon="reader"
					onClick={ this.clickReader }
					isActive={ this.isActive( 'reader' ) }
					tooltip={ translate( 'Read the blogs and topics you follow' ) }
					preloadSection={ this.preloadReader }
				>
					{ translate( 'Reader', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
				</Item>
				<Item
					tipTarget="me"
					url="/me"
					icon="user-circle"
					onClick={ this.clickMe }
					isActive={ this.isActive( 'me' ) }
					className="masterbar__item-me"
					tooltip={ translate( 'Update your profile, personal settings, and more' ) }
					preloadSection={ this.preloadMe }
				>
					<Gravatar user={ this.props.user.get() } alt="Me" size={ 18 } />
					<span className="masterbar__item-me-label">
						{ translate( 'Me', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
					</span>
				</Item>
				<Notifications
					user={ this.props.user }
					isShowing={ this.props.isNotificationsShowing }
					isActive={ this.isActive( 'notifications' ) }
					className="masterbar__item-notifications"
					tooltip={ translate( 'Manage your notifications' ) }
				>
					<span className="masterbar__item-notifications-label">
						{ translate( 'Notifications', { comment: 'Toolbar, must be shorter than ~12 chars' } ) }
					</span>
				</Notifications>
			</Masterbar>
		);
	}
}

export default connect(
	state => {
		// Falls back to using the user's primary site if no site has been selected
		// by the user yet

		return {
			isNotificationsShowing: isNotificationsOpen( state ),
			siteSlug: '',
		};
	},
	{ setNextLayoutFocus, recordTracksEvent }
)( localize( MasterbarLoggedIn ) );
