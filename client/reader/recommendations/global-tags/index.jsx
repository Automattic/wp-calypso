/** @format */
import React from 'react';
import Main from 'client/components/main';
import Navigation from 'client/reader/recommendations/navigation';

class RecommendedTags extends React.Component {
	render() {
		return (
			<Main>
				<Navigation selected="tags" />
				Trending tags
			</Main>
		);
	}
}

export default RecommendedTags;
