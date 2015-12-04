/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:me:sidebar-gravatar' );

/**
 * Internal dependencies
 */
var Gravatar = require( 'components/gravatar' ),
	eventRecorder = require( 'me/event-recorder' );

module.exports = React.createClass( {

	displayName: 'ProfileGravatar',

	mixins: [ eventRecorder ],

	componentDidMount: function() {
		debug( 'The ProfileGravatar component is mounted.' );
	},

	render: function() {
		var profileURL = '//gravatar.com/' + this.props.user.username;

		return (
			<div className="profile-gravatar">
				<a
					href="https://secure.gravatar.com/site/wpcom?wpcc-no-close"
					target="_blank"
					className="profile-gravatar__edit"
					onClick={ this.recordClickEvent( 'Gravatar Update Profile Photo in Sidebar' ) } >

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
