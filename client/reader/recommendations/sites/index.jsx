import React from 'react';
import Main from 'components/main';
import Navigation from 'reader/recommendations/navigation';

const RecommendedSites = React.createClass( {
	render() {
		return (
			<Main>
				<Navigation selected="sites" />
				Sites!
			</Main>
			);
	}
} );

export default RecommendedSites;
