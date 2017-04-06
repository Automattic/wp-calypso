/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

class SharingServiceDescription extends Component {
	static propTypes = {
		descriptions: PropTypes.object,
		numberOfConnections: PropTypes.number,
		translate: PropTypes.func,
	};

	static defaultProps = {
		descriptions: Object.freeze( {
			facebook: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Sharing posts to your news feed.', 'Sharing posts to your news feeds.', {
						count: this.props.numberOfConnections,
						comment: 'Description for Facebook Publicize when one or more accounts are connected'
					} );
				}

				return this.props.translate( 'Share posts to your news feed.', {
					comment: 'Description for Facebook Publicize when no accounts are connected'
				} );
			},
			twitter: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Sharing posts to your Twitter feed.', 'Sharing posts to your Twitter feeds.', {
						count: this.props.numberOfConnections,
						comment: 'Description for Twitter Publicize when one or more accounts are connected'
					} );
				}

				return this.props.translate( 'Share posts to your Twitter feed.', {
					comment: 'Description for Twitter Publicize when no accounts are connected'
				} );
			},
			google_plus: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Commenting and sharing to your profile.', 'Commenting and sharing to your profiles.', {
						count: this.props.numberOfConnections,
						comment: 'Description for Google+ Publicize when one or more accounts are connected'
					} );
				}

				return this.props.translate( 'Comment and share to your profile.', {
					comment: 'Description for Google+ Publicize when no accounts are connected'
				} );
			},
			linkedin: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Sharing posts to your connections.', {
						comment: 'Description for LinkedIn Publicize when one or more accounts are connected'
					} );
				}

				return this.props.translate( 'Share posts to your connections.', {
					comment: 'Description for LinkedIn Publicize when no accounts are connected'
				} );
			},
			tumblr: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Sharing posts to your Tumblr blog.', 'Sharing posts to your Tumblr blogs.', {
						count: this.props.numberOfConnections,
						comment: 'Description for Tumblr Publicize when one or more accounts are connected'
					} );
				}

				return this.props.translate( 'Share posts to your Tumblr blog.', {
					comment: 'Description for Tumblr Publicize when no accounts are connected'
				} );
			},
			path: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Sharing posts to your Path timeline.', 'Sharing posts to your Path timelines.', {
						count: this.props.numberOfConnections,
						comment: 'Description for Path Publicize when one or more accounts are connected'
					} );
				}

				return this.props.translate( 'Share posts to your Path timeline.', {
					comment: 'Description for Path Publicize when no accounts are connected'
				} );
			},
			eventbrite: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Connected to your Eventbrite account.', {
						comment: 'Description for Eventbrite when one or more accounts are connected'
					} );
				}

				return this.props.translate( 'Connect to your Eventbrite account.', {
					comment: 'Description for Eventbrite when no accounts are connected'
				} );
			},
			instagram: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Connected to your Instagram account.', {
						comment: 'Description for Instagram when one or more accounts are connected'
					} );
				}

				return this.props.translate( 'Connect to use the Instagram widget.', {
					comment: 'Description for Instagram when no accounts are connected'
				} );
			},
		} ),
		numberOfConnections: 0,
		translate: identity,
	};

	render() {
		let description;

		if ( 'reconnect' === this.props.status ) {
			description = this.props.translate( 'There is an issue connecting to %(service)s.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize'
			} );
		} else if ( 'function' === typeof this.props.descriptions[ this.props.service.ID ] ) {
			description = this.props.descriptions[ this.props.service.ID ].call( this );
		}

		return ( <p className="sharing-service__description">{ description }</p> );
	}
}

export default localize( SharingServiceDescription );
