/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderEmailSettings from 'blocks/reader-email-settings';
import Card from 'components/card';

const exampleSiteId = 70135762; // Longreads

export default class ReaderEmailSettingsExample extends React.Component {
	static displayName = 'ReaderEmailSettings';

	render() {
		return (
			<Card>
				<ReaderEmailSettings siteId={ exampleSiteId } />
			</Card>
		);
	}
}
