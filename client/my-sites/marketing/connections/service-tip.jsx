/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity, includes } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Module constants
 */
/**
 * Whitelist of services that we provide tips for.
 *
 * When adding tips for more services, please update the whitelist in addition to adding
 * a method with the tip's content.
 *
 * @type {string[]}
 */
const SERVICES_WHITELIST = [ 'facebook', 'twitter', 'instagram', 'google_plus' ];

class SharingServiceTip extends Component {
	static propTypes = {
		service: PropTypes.object.isRequired,
		translate: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
	};

	facebook() {
		return this.props.translate(
			'You can also add a {{likeBoxLink}}Like Box{{/likeBoxLink}}, a {{shareButtonLink}}share button{{/shareButtonLink}}, or {{embedLink}}embed{{/embedLink}} your page or profile on your site.',
			{
				components: {
					likeBoxLink: (
						<a
							href={ localizeUrl(
								'https://wordpress.com/support/facebook-integration/#facebook-like-box'
							) }
						/>
					),
					shareButtonLink: <a href={ localizeUrl( 'https://wordpress.com/support/sharing/' ) } />,
					embedLink: (
						<a
							href={ localizeUrl(
								'https://wordpress.com/support/facebook-integration/facebook-embeds/'
							) }
						/>
					),
				},
				context: 'Sharing: Tip in settings',
			}
		);
	}

	twitter() {
		return this.props.translate(
			'You can also add a {{widgetLink}}Twitter Timeline Widget{{/widgetLink}} to display any public timeline on your site.',
			{
				components: {
					widgetLink: (
						<a
							href={ localizeUrl(
								'https://wordpress.com/support/widgets/twitter-timeline-widget/'
							) }
						/>
					),
				},
				context: 'Sharing: Tip in settings',
			}
		);
	}

	instagram() {
		return this.props.translate(
			'You can also add an {{widgetLink}}Instagram Widget{{/widgetLink}} to display your latest Instagram photos on your site.',
			{
				components: {
					widgetLink: (
						<a
							href={ localizeUrl( 'https://wordpress.com/support/instagram/instagram-widget/' ) }
						/>
					),
				},
				context: 'Sharing: Tip in settings',
			}
		);
	}

	google_plus() {
		return null;
	}

	render() {
		const { service } = this.props;
		if ( ! includes( SERVICES_WHITELIST, service.ID ) || 'google_plus' === service.ID ) {
			return <div className="connections__sharing-service-tip" />;
		}

		return (
			<div className="connections__sharing-service-tip">
				<Gridicon icon="info" size={ 18 } />
				{ this[ service.ID ]() }
			</div>
		);
	}
}

export default localize( SharingServiceTip );
