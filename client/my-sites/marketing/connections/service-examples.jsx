import { FEATURE_SOCIAL_MASTODON_CONNECTION } from '@automattic/calypso-products';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import googleDriveExample from 'calypso/assets/images/connections/google-drive-screenshot.jpg';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import GooglePlusDeprication from './google-plus-deprecation';
import Mastodon from './mastodon';
import ServiceExample from './service-example';

/**
 * Module constants
 */
/**
 * List of services that we provide examples for.
 *
 * When adding examples for more services, please update the list in addition to adding
 * a method with the example's content.
 *
 * @type {string[]}
 */
const SERVICES_WITH_EXAMPLES = [
	'bandpage',
	'facebook',
	'google_plus',
	'google_my_business',
	'instagram-basic-display',
	'linkedin',
	'tumblr',
	'twitter',
	'google_photos',
	'google-drive',
	'mailchimp',
	'p2_slack',
	'p2_github',
	'mastodon',
];

class SharingServiceExamples extends Component {
	static propTypes = {
		service: PropTypes.object.isRequired,
		site: PropTypes.object,
		hasJetpack: PropTypes.bool,
		translate: PropTypes.func,
		action: PropTypes.func.isRequired,
		connections: PropTypes.array.isRequired,
		connectAnother: PropTypes.func.isRequired,
		isConnecting: PropTypes.bool,
	};

	static defaultProps = {
		site: Object.freeze( {} ),
		hasJetpack: false,
	};

	getSharingButtonsLink() {
		if ( this.props.site ) {
			return isJetpackCloud()
				? 'https://jetpack.com/redirect/?source=calypso-marketing-sharing-buttons&site=' +
						this.props.site.slug
				: '/sharing/buttons/' + this.props.site.slug;
		}
		return localizeUrl( 'https://wordpress.com/support/sharing/' );
	}

	bandpage() {
		return [
			{
				image: {
					src: '/calypso/images/sharing/bandpage-widget.png',
					alt: this.props.translate( 'Add a BandPage widget', { textOnly: true } ),
				},
				label: this.props.translate(
					'Add a {{link}}BandPage widget{{/link}} to display your music, photos, videos bio, and event listings.',
					{
						components: {
							link: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/widgets/bandpage-widget/' ) }
								/>
							),
						},
					}
				),
			},
		];
	}

	google_photos() {
		return [
			{
				image: {
					src: '/calypso/images/sharing/connections-google-photos.png',
					alt: this.props.translate(
						'Connect to use photos stored in your Google Photos library directly inside the editor',
						{ textOnly: true }
					),
				},
				label: this.props.translate(
					'{{strong}}Connect{{/strong}} to use photos stored in your Google Photos library directly inside the editor.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			},
		];
	}

	google_drive() {
		return [
			{
				image: {
					src: googleDriveExample,
					alt: this.props.translate( 'Connect to use Google sheets in Jetpack forms.', {
						textOnly: true,
					} ),
				},
				label: this.props.translate(
					'{{strong}}Connect{{/strong}} to use Google sheets in Jetpack forms.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			},
		];
	}

	facebook() {
		const label = this.props.translate(
			'{{strong}}Connect{{/strong}} to automatically share posts on your Facebook page.',
			{
				components: {
					strong: <strong />,
				},
			}
		);
		const image = {
			src: '/calypso/images/sharing/connections-facebook.png',
			alt: this.props.translate( 'Share posts to your Facebook page', {
				textOnly: true,
			} ),
		};
		return this.props.hasJetpack
			? [
					{
						image,
						label,
					},
					{
						image: {
							src: '/calypso/images/sharing/connections-button-facebook.png',
							alt: this.props.translate( 'Add a sharing button', { textOnly: true } ),
						},
						label: this.props.translate(
							'Add a {{link}}sharing button{{/link}} to your posts so readers can share your story with their friends.',
							{
								components: {
									link: <a href={ this.getSharingButtonsLink() } />,
								},
							}
						),
					},
			  ]
			: [
					{
						label,
					},
					{
						image,
					},
			  ];
	}

	google_my_business() {
		return [
			{
				image: {
					src: '/calypso/images/google-my-business/stats-screenshot-cropped.png',
					alt: this.props.translate( 'Manage Google My Business locations', { textOnly: true } ),
				},
				label: this.props.translate(
					'{{strong}}Connect{{/strong}} to view stats and other useful information from your ' +
						'Google My Business account inside WordPress.com.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			},
		];
	}

	instagram_basic_display() {
		return [
			{
				image: {
					src: '/calypso/images/sharing/connections-instagram.png',
					alt: this.props.translate( 'Add an Instagram widget', { textOnly: true } ),
				},
				label: this.props.translate(
					'Add an {{link}}Instagram widget{{/link}} to display your latest photos.',
					{
						components: {
							link: (
								<a
									href={ localizeUrl(
										'https://wordpress.com/support/instagram/instagram-widget/'
									) }
								/>
							),
						},
					}
				),
			},
		];
	}

	linkedin() {
		const label = this.props.translate(
			'{{strong}}Connect{{/strong}} to automatically share posts with your LinkedIn connections.',
			{
				components: {
					strong: <strong />,
				},
			}
		);
		const image = {
			src: '/calypso/images/sharing/connections-linkedin.png',
			alt: this.props.translate( 'Share posts with your LinkedIn connections', {
				textOnly: true,
			} ),
		};
		return this.props.hasJetpack
			? [
					{
						image,
						label,
					},
					{
						image: {
							src: '/calypso/images/sharing/connections-button-linkedin.png',
							alt: this.props.translate( 'Add a sharing button', { textOnly: true } ),
						},
						label: this.props.translate(
							'Add a {{link}}sharing button{{/link}} to your posts so readers can share your story with their connections.',
							{
								components: {
									link: <a href={ this.getSharingButtonsLink() } />,
								},
							}
						),
					},
			  ]
			: [
					{
						label,
					},
					{
						image,
					},
			  ];
	}

	tumblr() {
		const label = this.props.translate(
			'{{strong}}Connect{{/strong}} to automatically share posts to your Tumblr blog.',
			{
				components: {
					strong: <strong />,
				},
			}
		);
		const image = {
			src: '/calypso/images/sharing/connections-tumblr.png',
			alt: this.props.translate( 'Share posts to your Tumblr blog', { textOnly: true } ),
		};
		return this.props.hasJetpack
			? [
					{
						image,
						label,
					},
					{
						image: {
							src: '/calypso/images/sharing/connections-button-tumblr.png',
							alt: this.props.translate( 'Add a sharing button', { textOnly: true } ),
						},
						label: this.props.translate(
							'Add a {{link}}sharing button{{/link}} to your posts so readers can share your story with their followers.',
							{
								components: {
									link: <a href={ this.getSharingButtonsLink() } />,
								},
							}
						),
					},
			  ]
			: [
					{
						label,
					},
					{
						image,
					},
			  ];
	}

	twitter() {
		const label = this.props.translate(
			'{{strong}}Connect{{/strong}} to automatically share posts with your Twitter followers.',
			{
				components: {
					strong: <strong />,
				},
			}
		);
		const image = {
			src: '/calypso/images/sharing/connections-twitter2.png',
			alt: this.props.translate( 'Share posts to your Twitter followers', { textOnly: true } ),
		};
		return this.props.hasJetpack
			? [
					{
						image,
						label,
					},
					{
						image: {
							src: '/calypso/images/sharing/connections-twitter.png',
							alt: this.props.translate( 'Add a Twitter Timeline Widget', { textOnly: true } ),
						},
						label: this.props.translate(
							'Add a {{link}}Twitter Timeline Widget{{/link}} to display your latest tweets on your site.',
							{
								components: {
									link: (
										<a
											href={ localizeUrl(
												'https://wordpress.com/support/widgets/twitter-timeline-widget/'
											) }
										/>
									),
								},
							}
						),
					},
			  ]
			: [
					{
						label,
					},
					{
						image,
					},
			  ];
	}

	p2_slack() {
		return [
			{
				image: {
					src: '/calypso/images/sharing/slack-screenshot-1.png',
					alt: this.props.translate( 'Get Slack notifications with every new P2 post.', {
						textOnly: true,
					} ),
				},
				label: this.props.translate(
					'Get {{strong}}Slack notifications{{/strong}} with every new P2 post.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			},
			{
				image: {
					src: '/calypso/images/sharing/slack-screenshot-2.png',
					alt: this.props.translate( 'Preview posts and pages directly from Slack.', {
						textOnly: true,
					} ),
				},
				label: this.props.translate(
					'{{strong}}Preview posts and pages{{/strong}} directly from Slack.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			},
		];
	}

	p2_github() {
		return [
			{
				image: {
					src: '/calypso/images/sharing/github-screenshot.png',
					alt: this.props.translate( 'Get GitHub previews inside your P2 posts.', {
						textOnly: true,
					} ),
				},
				label: this.props.translate(
					'Get {{strong}}GitHub previews{{/strong}} inside your P2 posts.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			},
		];
	}

	mailchimp() {
		return [
			{
				image: {
					src: '/calypso/images/sharing/mailchimp-screenshot.png',
					alt: this.props.translate( 'Add subscribers to Mailchimp', { textOnly: true } ),
				},
				label: this.props.translate(
					'Enable site visitors to sign up for your Mailchimp content.'
				),
			},
		];
	}

	render() {
		if ( ! includes( SERVICES_WITH_EXAMPLES, this.props.service.ID ) ) {
			/**
			 * TODO: Refactoring this line has to be tackled in a seperate diff.
			 * Touching this changes services-group.jsx which changes service.jsx
			 * Basically whole folder needs refactoring.
			 */
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			return <div className="sharing-service-examples" />;
		}

		if ( 'google_plus' === this.props.service.ID ) {
			return <GooglePlusDeprication />;
		}

		if ( 'mastodon' === this.props.service.ID && this.props.isMastodonEligible ) {
			return (
				<Mastodon
					service={ this.props.service }
					action={ this.props.action }
					connectAnother={ this.props.connectAnother }
					connections={ this.props.connections }
					isConnecting={ this.props.isConnecting }
				/>
			);
		}

		const examples = this[ this.props.service.ID.replace( /-/g, '_' ) ]();

		return (
			/**
			 * TODO: Refactoring this line has to be tackled in a seperate diff.
			 * Touching this changes services-group.jsx which changes service.jsx
			 * Basically whole folder needs refactoring.
			 */
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			<div className="sharing-service-examples">
				{ examples.map( ( example, index ) => (
					<ServiceExample
						key={ index }
						image={ example.image }
						label={ example.label }
						single={ 1 === examples.length }
					/>
				) ) }
			</div>
		);
	}
}

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );

	return {
		site: getSelectedSite( state ),
		hasJetpack: ! isJetpackCloud() || isJetpackSite( state, getSelectedSiteId( state ) ),
		isMastodonEligible: siteHasFeature( state, siteId, FEATURE_SOCIAL_MASTODON_CONNECTION ),
	};
} )( localize( SharingServiceExamples ) );
