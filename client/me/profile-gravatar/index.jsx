/**
 * External dependencies
 */
import React from 'react';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import eventRecorder from 'me/event-recorder';
import config from 'config';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:me:sidebar-gravatar' );

module.exports = React.createClass( {

	displayName: 'ProfileGravatar',

	mixins: [ eventRecorder ],

	componentDidMount: function() {
		debug( 'The ProfileGravatar component is mounted.' );
	},

	render: function() {
		const profileURL = '//gravatar.com/' + this.props.user.username;
		let updateProps = {
			href: '/me/gravatar',
			className: 'profile-gravatar__edit',
			onClick: this.recordClickEvent( 'Gravatar Update Profile Photo in Sidebar' )
		};

		// Legacy support
		if ( ! config.isEnabled( 'me/gravatar' ) ) {
			updateProps = Object.assign( updateProps, {
				href: 'https://secure.gravatar.com/site/wpcom?wpcc-no-close',
				target: '_blank'
			} );
		}

		return (
			<div className="profile-gravatar">
				<a { ... updateProps } >

					<Gravatar user={ this.props.user } size={ 150 } imgSize={ 400 } />

					<span className="profile-gravatar__edit-label-wrap">
						<span className="profile-gravatar__edit-label">
							{ this.translate( 'Update Profile Photo' ) }
						</span>
					</span>
				</a>

				<h2 className="profile-gravatar__user-display-name">{ this.props.user.display_name }</h2>

				<div className="profile-gravatar__user-secondary-info">
					<a href={ profileURL }>@{ this.props.user.username }</a>
				</div>
			</div>
		);
	}
} );
