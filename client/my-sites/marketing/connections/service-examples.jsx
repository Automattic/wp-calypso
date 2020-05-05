/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { identity, includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import ServiceExample from './service-example';
import GooglePlusDeprication from './google-plus-deprecation';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Module constants
 */
/**
 * Whitelist of services that we provide examples for.
 *
 * When adding examples for more services, please update the whitelist in addition to adding
 * a method with the example's content.
 *
 * @type {string[]}
 */
const SERVICES_WHITELIST = [
	'bandpage',
	'facebook',
	'google_plus',
	'google_my_business',
	'instagram-basic-display',
	'linkedin',
	'tumblr',
	'twitter',
	'google_photos',
	'mailchimp',
];

class SharingServiceExamples extends Component {
	static propTypes = {
		service: PropTypes.object.isRequired,
		site: PropTypes.object,
		translate: PropTypes.func,
	};

	static defaultProps = {
		site: Object.freeze( {} ),
		translate: identity,
	};

	getSharingButtonsLink() {
		return this.props.site
			? '/sharing/buttons/' + this.props.site.slug
			: localizeUrl( 'https://wordpress.com/support/sharing/' );
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
					src: '/calypso/images/sharing/google-photos.png',
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

	facebook() {
		return [
			{
				image: {
					src: '/calypso/images/sharing/facebook-profile.png',
					alt: this.props.translate( 'Share posts to your Facebook page', {
						textOnly: true,
					} ),
				},
				label: this.props.translate(
					'{{strong}}Connect{{/strong}} to automatically share posts on your Facebook page.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			},
			{
				image: {
					src: '/calypso/images/sharing/facebook-sharing.png',
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
					src: '/calypso/images/sharing/instagram-widget.png',
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
		return [
			{
				image: {
					src: '/calypso/images/sharing/linkedin-publicize.png',
					alt: this.props.translate( 'Share posts with your LinkedIn connections', {
						textOnly: true,
					} ),
				},
				label: this.props.translate(
					'{{strong}}Connect{{/strong}} to automatically share posts with your LinkedIn connections.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			},
			{
				image: {
					src: '/calypso/images/sharing/linkedin-sharing.png',
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
		];
	}

	tumblr() {
		return [
			{
				image: {
					src: '/calypso/images/sharing/tumblr-publicize.png',
					alt: this.props.translate( 'Share posts to your Tumblr blog', { textOnly: true } ),
				},
				label: this.props.translate(
					'{{strong}}Connect{{/strong}} to automatically share posts to your Tumblr blog.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			},
			{
				image: {
					src: '/calypso/images/sharing/tumblr-sharing.png',
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
		];
	}

	twitter() {
		return [
			{
				image: {
					src: '/calypso/images/sharing/twitter-publicize.png',
					alt: this.props.translate( 'Share posts to your Twitter followers', { textOnly: true } ),
				},
				label: this.props.translate(
					'{{strong}}Connect{{/strong}} to automatically share posts with your Twitter followers.',
					{
						components: {
							strong: <strong />,
						},
					}
				),
			},
			{
				image: {
					src: '/calypso/images/sharing/twitter-timeline.png',
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
		if ( ! includes( SERVICES_WHITELIST, this.props.service.ID ) ) {
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

export default connect( ( state ) => ( {
	site: getSelectedSite( state ),
} ) )( localize( SharingServiceExamples ) );
