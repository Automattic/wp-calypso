/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'SharingServiceDescription',

	propTypes: {
		descriptions: React.PropTypes.object,
		numberOfConnections: React.PropTypes.number
	},

	getDefaultProps: function() {
		return {
			descriptions: Object.freeze( {
				facebook: function() {
					if ( this.props.numberOfConnections > 0 ) {
						return this.translate( 'Sharing posts to your news feed.', 'Sharing posts to your news feeds.', {
							count: this.props.numberOfConnections,
							comment: 'Description for Facebook Publicize when one or more accounts are connected'
						} );
					} else {
						return this.translate( 'Share posts to your news feed.', { comment: 'Description for Facebook Publicize when no accounts are connected' } );
					}
				},
				twitter: function() {
					if ( this.props.numberOfConnections > 0 ) {
						return this.translate( 'Sharing posts to your Twitter feed.', 'Sharing posts to your Twitter feeds.', {
							count: this.props.numberOfConnections,
							comment: 'Description for Twitter Publicize when one or more accounts are connected'
						} );
					} else {
						return this.translate( 'Share posts to your Twitter feed.', { comment: 'Description for Twitter Publicize when no accounts are connected' } );
					}
				},
				google_plus: function() {
					if ( this.props.numberOfConnections > 0 ) {
						return this.translate( 'Commenting and sharing to your profile.', 'Commenting and sharing to your profiles.', {
							count: this.props.numberOfConnections,
							comment: 'Description for Google+ Publicize when one or more accounts are connected'
						} );
					} else {
						return this.translate( 'Comment and share to your profile.', { comment: 'Description for Google+ Publicize when no accounts are connected' } );
					}
				},
				linkedin: function() {
					if ( this.props.numberOfConnections > 0 ) {
						return this.translate( 'Sharing posts to your connections.', { comment: 'Description for LinkedIn Publicize when one or more accounts are connected' } );
					} else {
						return this.translate( 'Share posts to your connections.', { comment: 'Description for LinkedIn Publicize when no accounts are connected' } );
					}
				},
				tumblr: function() {
					if ( this.props.numberOfConnections > 0 ) {
						return this.translate( 'Sharing posts to your Tumblr blog.', 'Sharing posts to your Tumblr blogs.', {
							count: this.props.numberOfConnections,
							comment: 'Description for Tumblr Publicize when one or more accounts are connected'
						} );
					} else {
						return this.translate( 'Share posts to your Tumblr blog.', { comment: 'Description for Tumblr Publicize when no accounts are connected' } );
					}
				},
				path: function() {
					if ( this.props.numberOfConnections > 0 ) {
						return this.translate( 'Sharing posts to your Path timeline.', 'Sharing posts to your Path timelines.', {
							count: this.props.numberOfConnections,
							comment: 'Description for Path Publicize when one or more accounts are connected'
						} );
					} else {
						return this.translate( 'Share posts to your Path timeline.', { comment: 'Description for Path Publicize when no accounts are connected' } );
					}
				},
				eventbrite: function() {
					if ( this.props.numberOfConnections > 0 ) {
						return this.translate( 'Connected to your Eventbrite account.', { comment: 'Description for Eventbrite when one or more accounts are connected' } );
					} else {
						return this.translate( 'Connect to your Eventbrite account.', { comment: 'Description for Eventbrite when no accounts are connected' } );
					}
				}
			} ),
			numberOfConnections: 0
		};
	},

	render: function() {
		var description;
		if ( 'reconnect' === this.props.status ) {
			description = this.translate( 'There is an issue connecting to %(service)s.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize'
			} );
		} else if ( 'function' === typeof this.props.descriptions[ this.props.service.name ] ) {
			description = this.props.descriptions[ this.props.service.name ].call( this );
		}

		return ( <p className="sharing-service__description">{ description }</p> );
	}
} );
