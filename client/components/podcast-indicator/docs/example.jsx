/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PodcastIndicator from '../index';

class PodcastIndicatorExample extends React.PureComponent {
	static displayName = 'PodcastIndicator';

	render() {
		return <PodcastIndicator size={ 24 } hasTooltip={ true } />;
	}
}

export default PodcastIndicatorExample;
