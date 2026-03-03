import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import googleDriveExample from 'calypso/assets/images/connections/google-drive-screenshot.jpg';
import InlineSupportLink from 'calypso/components/inline-support-link';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import GooglePlusDeprication from './google-plus-deprecation';
import ServiceExample from './service-example';
import './service-examples.scss';

/**
 * Module constants
 */
/**
 * List of services that we provide examples for.
 *
 * When adding examples for more services, please update the list in addition to adding
 * a method with the example's content.
 * @type {string[]}
 */
export const SERVICES_WITH_EXAMPLES = [
	'bandpage',
	'google-drive',
	'google_my_business',
	'google_photos',
	'google_plus',
	'instagram-basic-display',
	'mailchimp',
	'p2_github',
	'p2_slack',
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

	google_my_business() {
		return [
			{
				image: {
					src: '/calypso/images/google-my-business/stats-screenshot-cropped.png',
					alt: this.props.translate( 'Manage Google Business Profile locations', {
						textOnly: true,
					} ),
				},
				label: this.props.translate(
					'{{strong}}Connect{{/strong}} to view stats and other useful information from your ' +
						'Google Business Profile account inside WordPress.com.',
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
					alt: this.props.translate( 'Add the Latest Instagram Posts block', { textOnly: true } ),
				},
				label: this.props.translate(
					'Add the {{link}}Latest Instagram Posts block{{/link}} to display your latest photos.',
					{
						components: {
							link: (
								<InlineSupportLink
									showIcon={ false }
									supportPostId={ 421832 }
									supportLink={ localizeUrl(
										'https://wordpress.com/support/latest-instagram-posts/'
									) }
								/>
							),
						},
					}
				),
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
	return {
		site: getSelectedSite( state ),
		hasJetpack: ! isJetpackCloud() || isJetpackSite( state, getSelectedSiteId( state ) ),
	};
} )( localize( SharingServiceExamples ) );
