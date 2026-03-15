import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
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
		} ),
		numberOfConnections: 0,
	};

	render() {
		let description;

		if ( 'google_photos' === this.props.service.ID && 'must-disconnect' === this.props.status ) {
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
