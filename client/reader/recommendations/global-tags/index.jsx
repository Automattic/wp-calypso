/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import Navigation from 'reader/recommendations/navigation';

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
