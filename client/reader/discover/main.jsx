/**
* External dependencies
*/
import React  from 'react';
import { connect } from 'react-redux';
import Masonary from 'react-masonry-component';
import map from 'lodash/map';

/**
* Internal dependencies
*/
import Main from 'components/main';
import DiscoverCard from './card';
//import DiscoverCard from './card';
import QueryReaderDiscoverPosts from 'components/data/query-reader-discover';
import { getDiscoverPostIds } from 'state/reader/discover/selectors';

class Discover extends React.Component {

	constructor( props ) {
		super( props );
		this.state = {
			posts: {},
			updateCount: 0,
			selectedIndex: 0
		};
	}

	render() {
		return (
		<Main classNames="discover__main">
			<QueryReaderDiscoverPosts />
			<header className="discover__header" >
				<h1 className="discover__header-title">This is Discover</h1>
				</header>
			<Masonary className="discover__cards" updateOnEachImageLoad={ true } options={ { gutter: 14 } }>
				{ map( this.props.discoverPostIds, ( postId ) => {
					return (
							<DiscoverCard key={ postId } postId={ postId } />
					); } )
				}
			</Masonary>
		</Main>
	);
	}
}

export default connect(
	( state ) => {
		return {
			discoverPostIds: getDiscoverPostIds( state )
		};
	}
)( Discover );
