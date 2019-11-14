/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

export class ActivityLogDocumentationLink extends Component {
	static propTypes = {
		eventName: PropTypes.string,
		source: PropTypes.string,
		text: PropTypes.string,
		url: PropTypes.string,
	};

	handleClick = () => {
		const { eventName, source } = this.props;
		analytics.tracks.recordEvent( eventName, { source } );
	};

	render() {
		const { url, text, translate } = this.props;
		return (
			<a href={ url } onClick={ this.handleClick }>
				{ text ? text : translate( 'Learn More' ) }
			</a>
		);
	}
}

ActivityLogDocumentationLink.defaultProps = {
	eventName: 'calypso_activitylog_documentation_click',
	source: 'unknown',
	text: null,
	url: 'https://jetpack.com/support/activity-log/',
};

export default localize( ActivityLogDocumentationLink );
