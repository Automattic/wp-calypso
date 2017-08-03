import React from 'react';
import Main from 'components/main';
import Navigation from 'reader/recommendations/navigation';

class RecommendedSites extends React.Component {
	render() {
		return (
			<Main>
				<Navigation selected="sites" />
				Sites!
			</Main>
		);
	}
}

export default RecommendedSites;
