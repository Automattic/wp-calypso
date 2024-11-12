import { localizeUrl } from '@automattic/i18n-utils';
import { ExternalLink } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import InfoPopover from 'calypso/components/info-popover';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

import './service-description.scss';

class SharingServiceDescription extends Component {
	static propTypes = {
		descriptions: PropTypes.object,
		numberOfConnections: PropTypes.number,
		translate: PropTypes.func,
		moment: PropTypes.func,
	};

	static defaultProps = {
		descriptions: Object.freeze( {
			bluesky() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Sharing posts to your Bluesky profile.' );
				}
				return this.props.translate( 'Share posts to your Bluesky profile.' );
			},
			facebook: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate(
						'Sharing posts to your Facebook page.',
						'Sharing posts to your Facebook pages.',
						{
							count: this.props.numberOfConnections,
							comment: 'Description for Facebook Publicize when one or more accounts are connected',
						}
					);
				}

				return this.props.translate(
					'Facebook’s massive active user base makes for a great place to share your posts and connect with your followers.',
					{
						comment: 'Description for Facebook Publicize when no accounts are connected',
					}
				);
			},
			instagram_business: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate(
						'Sharing photos to your Instagram account.',
						'Sharing photos to your Instagram accounts.',
						{
							count: this.props.numberOfConnections,
							comment:
								'Description for Instagram Publicize when one or more accounts are connected',
						}
					);
				}

				return (
					<>
						{ this.props.translate(
							'Share photos from your site to your Instagram Business account.',
							{
								comment: 'Description for Instagram Publicize when no accounts are connected',
							}
						) }
						<InfoPopover className="instagram-business__info">
							{ this.props.translate(
								'Instagram requires a business account connected to Facebook in order to work with third party services.'
							) }
							<ExternalLink
								className="instagram-business__help-link"
								href="https://jetpack.com/redirect/?source=jetpack-social-instagram-business-help"
							>
								{ this.props.translate( 'Learn how to convert & link your Instagram account.' ) }
							</ExternalLink>
						</InfoPopover>
					</>
				);
			},
			twitter: function () {
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

				return this.props.translate(
					'Keep your followers up to date with your news, events, and other happenings by sharing posts on your Twitter feed.',
					{
						comment: 'Description for Twitter Publicize when no accounts are connected',
					}
				);
			},
			google_plus: function () {
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
			mailchimp: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate(
						'Allow users to sign up to your Mailchimp mailing list.',
						'Allow users to sign up to your Mailchimp mailing lists.',
						{
							count: this.props.numberOfConnections,
						}
					);
				}

				return this.props.translate( 'Allow users to sign up to your Mailchimp mailing list.' );
			},
			linkedin: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Sharing posts to your connections.', {
						comment: 'Description for LinkedIn Publicize when one or more accounts are connected',
					} );
				}

				return this.props.translate(
					'Reach a professional audience and contribute valuable content by sharing your posts with the LinkedIn community.',
					{
						comment: 'Description for LinkedIn Publicize when no accounts are connected',
					}
				);
			},
			tumblr: function () {
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

				return this.props.translate(
					'Sharing posts on your Tumblr blog expands your reach to a diverse younger audience in a fun and creative community.',
					{
						comment: 'Description for Tumblr Publicize when no accounts are connected',
					}
				);
			},
			instagram_basic_display: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Connected to your Instagram account.', {
						comment: 'Description for Instagram when one or more accounts are connected',
					} );
				}

				return this.props.translate( 'Connect to use the Latest Instagram Posts block.', {
					comment: 'Description for Instagram when no accounts are connected',
				} );
			},
			google_photos: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Access photos stored in your Google Photos library.', {
						comment: 'Description for Google Photos when one or more accounts are connected',
					} );
				}

				return this.props.translate( 'Access photos stored in your Google Photos library', {
					comment: 'Description for Google Photos when no accounts are connected',
				} );
			},
			google_drive: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Create and access files in your Google Drive', {
						comment: 'Description for Google Drive when one or more accounts are connected',
					} );
				}

				return this.props.translate( 'Create and access files stored in your Google Drive', {
					comment: 'Description for Google Drive when no accounts are connected',
				} );
			},
			google_my_business: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Connected to your Google Business Profile account.', {
						comment: 'Description for Google Business Profile when an account is connected',
					} );
				}

				return this.props.translate( 'Connect to your Google Business Profile account.', {
					comment: 'Description for Google Business Profile when no account is connected',
				} );
			},
			p2_slack: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Workspace connected to Slack.', {
						comment: 'Get slack notifications on new P2 posts.',
					} );
				}

				return this.props.translate( 'Connect this workspace to your Slack.', {
					comment: 'Get slack notifications on new P2 posts.',
				} );
			},
			p2_github: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Workspace connected to GitHub.', {
						comment: 'Embed GitHub Issues in P2 posts.',
					} );
				}

				return this.props.translate( 'Connect this workspace to your GitHub.', {
					comment: 'Embed GitHub Issues in P2 posts.',
				} );
			},
			mastodon: function () {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate(
						'Sharing posts to your Mastodon feed.',
						'Sharing posts to your Mastodon feeds.',
						{
							count: this.props.numberOfConnections,
							comment: 'Description for Mastodon Publicize when one or more accounts are connected',
						}
					);
				}

				return this.props.translate( 'Share posts to your Mastodon feed.', {
					comment: 'Description for Mastodon Publicize when no accounts are connected',
				} );
			},
			nextdoor() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Sharing posts to Nextdoor.' );
				}
				return this.props.translate( 'Share posts with your local community on Nextdoor.' );
			},
			threads() {
				if ( this.props.numberOfConnections > 0 ) {
					return this.props.translate( 'Sharing posts to Threads.' );
				}
				return this.props.translate( 'Share posts to your Threads feed.' );
			},
		} ),
		numberOfConnections: 0,
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
								href={ localizeUrl( 'https://wordpress.com/support/publicize/#facebook-pages' ) }
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
				}
			);
		} else if (
			'google_photos' === this.props.service.ID &&
			'must-disconnect' === this.props.status
		) {
			description = this.props.translate( 'Please connect again to continue using Google Photos.' );
		} else if ( 'reconnect' === this.props.status || 'must-disconnect' === this.props.status ) {
			description = this.props.translate( 'There is an issue connecting to %(service)s.', {
				args: { service: this.props.service.label },
				context: 'Sharing: Publicize',
			} );
		} else if ( 'refresh-failed' === this.props.status ) {
			const nowInSeconds = Math.floor( Date.now() / 1000 );
			if ( this.props.expires && this.props.expires > nowInSeconds ) {
				description = this.props.translate(
					'Please reconnect to %(service)s before your connection expires on %(expiryDate)s.',
					{
						args: {
							service: this.props.service.label,
							expiryDate: this.props.moment( this.props.expires * 1000 ).format( 'll' ),
						},
					}
				);
			} else {
				description = this.props.translate(
					'Your connection has expired. Please reconnect to %(service)s.',
					{
						args: { service: this.props.service.label },
					}
				);
			}
		} else if (
			'function' === typeof this.props.descriptions[ this.props.service.ID.replace( /-/g, '_' ) ]
		) {
			description =
				this.props.descriptions[ this.props.service.ID.replace( /-/g, '_' ) ].call( this );
		}

		/**
		 * TODO: Refactoring this line has to be tackled in a seperate diff.
		 * Touching this changes services-group.jsx which changes service.jsx
		 * Basically whole folder needs refactoring.
		 */
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		return <p className="sharing-service__description">{ description }</p>;
	}
}

export default localize( withLocalizedMoment( SharingServiceDescription ) );
