/** @format */
import React from 'react';
import Main from 'client/components/main';
import Navigation from 'client/reader/recommendations/navigation';

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
