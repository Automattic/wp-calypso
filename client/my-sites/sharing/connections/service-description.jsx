/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
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
					return this.props.translate(
						'Sharing posts to your news feed.',
						'Sharing posts to your news feeds.',
						{
							count: this.props.numberOfConnections,
							comment: 'Description for Facebook Publicize when one or more accounts are connected',
						}
					);
				}

				return this.props.translate( 'Share posts to your news feed.', {
					comment: 'Description for Facebook Publicize when no accounts are connected',
				} );
			},
			twitter: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate(
						'Sharing posts to your Twitter feed.',
						'Sharing posts to your Twitter feeds.',
						{
							count: this.props.numberOfConnections,
							comment: 'Description for Twitter Publicize when one or more accounts are connected',
						}
					);
				}

				return this.props.translate( 'Share posts to your Twitter feed.', {
					comment: 'Description for Twitter Publicize when no accounts are connected',
				} );
			},
			google_plus: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate(
						'Commenting and sharing to your profile.',
						'Commenting and sharing to your profiles.',
						{
							count: this.props.numberOfConnections,
							comment: 'Description for Google+ Publicize when one or more accounts are connected',
						}
					);
				}

				return this.props.translate( 'Comment and share to your profile.', {
					comment: 'Description for Google+ Publicize when no accounts are connected',
				} );
			},
			linkedin: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Sharing posts to your connections.', {
						comment: 'Description for LinkedIn Publicize when one or more accounts are connected',
					} );
				}

				return this.props.translate( 'Share posts to your connections.', {
					comment: 'Description for LinkedIn Publicize when no accounts are connected',
				} );
			},
			tumblr: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate(
						'Sharing posts to your Tumblr blog.',
						'Sharing posts to your Tumblr blogs.',
						{
							count: this.props.numberOfConnections,
							comment: 'Description for Tumblr Publicize when one or more accounts are connected',
						}
					);
				}

				return this.props.translate( 'Share posts to your Tumblr blog.', {
					comment: 'Description for Tumblr Publicize when no accounts are connected',
				} );
			},
			eventbrite: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Connected to your Eventbrite account.', {
						comment: 'Description for Eventbrite when one or more accounts are connected',
					} );
				}

				return this.props.translate( 'Connect to your Eventbrite account.', {
					comment: 'Description for Eventbrite when no accounts are connected',
				} );
			},
			instagram: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Connected to your Instagram account.', {
						comment: 'Description for Instagram when one or more accounts are connected',
					} );
				}

				return this.props.translate( 'Connect to use the Instagram widget.', {
					comment: 'Description for Instagram when no accounts are connected',
				} );
			},
			google_photos: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Access photos stored in your connected Google account.', {
						comment: 'Description for Google Photos when one or more accounts are connected',
					} );
				}

				return this.props.translate(
					'Access photos stored in your Google account{{sup}}*{{/sup}}',
					{
						components: {
							sup: <sup />,
						},
						comment: 'Description for Google Photos when no accounts are connected',
					}
				);
			},
			google_my_business: function() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Connected to your Google My Business account.', {
						comment: 'Description for Google My Business when an account is connected',
					} );
				}

				return this.props.translate( 'Connect to your Google My Business account.', {
					comment: 'Description for Google My Business when no account is connected',
				} );
			},
		} ),
		numberOfConnections: 0,
		translate: identity,
	};

	render() {
		let description;

		// Temporary message: the `must-disconnect` status for Facebook connection is likely due to Facebook API changes
		if ( 'facebook' === this.props.service.ID && 'must-disconnect' === this.props.status ) {
			description = this.props.translate(
				'As of August 1, 2018, Facebook no longer allows direct sharing of posts to Facebook Profiles. ' +
					'Connections to Facebook Pages remain unchanged. {{a}}Learn more{{/a}}',
				{
					components: {
						a: (
							<a
								href="https://en.support.wordpress.com/publicize/#facebook-pages"
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			);
		} else if ( 'reconnect' === this.props.status || 'must-disconnect' === this.props.status ) {
			description = this.props.translate( 'There is an issue connecting to %(service)s.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize',
			} );
		} else if ( 'function' === typeof this.props.descriptions[ this.props.service.ID ] ) {
			description = this.props.descriptions[ this.props.service.ID ].call( this );
		}

		return <p className="sharing-service__description">{ description }</p>;
	}
}

export default localize( SharingServiceDescription );
