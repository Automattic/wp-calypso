/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { identity, includes } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

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
const SERVICES_WHITELIST = [ 'facebook', 'twitter', 'instagram', 'google_plus', 'eventbrite' ];

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
						<a href="https://support.wordpress.com/facebook-integration/#facebook-like-box" />
					),
					shareButtonLink: <a href="https://support.wordpress.com/sharing/" />,
					embedLink: (
						<a href="https://support.wordpress.com/facebook-integration/facebook-embeds/" />
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
					widgetLink: <a href="https://support.wordpress.com/widgets/twitter-timeline-widget/" />,
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
					widgetLink: <a href="https://support.wordpress.com/instagram/instagram-widget/" />,
				},
				context: 'Sharing: Tip in settings',
			}
		);
	}

	google_plus() {
		return null;
	}

	eventbrite() {
		return this.props.translate(
			'You can also add the {{embedLink}}Eventbrite widget{{/embedLink}} to display events in a sidebar.',
			{
				components: {
					embedLink: (
						<a href="https://support.wordpress.com/widgets/eventbrite-event-calendarlisting-widget/" />
					),
				},
				context: 'Sharing: Tip in settings',
			}
		);
	}

	render() {
		const { service } = this.props;
		if ( ! includes( SERVICES_WHITELIST, service.ID ) || 'google_plus' === service.ID ) {
			return <div className="sharing-service-tip" />;
		}

		return (
			<div className="sharing-service-tip">
				<Gridicon icon="info" size={ 18 } />
				{ this[ service.ID ]() }
			</div>
		);
	}
}

export default localize( SharingServiceTip );
