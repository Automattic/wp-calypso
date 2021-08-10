import React from 'react';
import PodcastIndicator from '../index';

class PodcastIndicatorExample extends React.PureComponent {
	static displayName = 'PodcastIndicator';

	render() {
		return <PodcastIndicator size={ 24 } tooltipType="episode" />;
	}
}

export default PodcastIndicatorExample;
