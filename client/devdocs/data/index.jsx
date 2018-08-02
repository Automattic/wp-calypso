/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import { trim } from 'lodash';
import { slugToCamelCase } from 'devdocs/docs-example/util';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SearchCard from 'components/search-card';

/**
 * Docs examples
 */
import Collection from 'devdocs/design/search-collection';
import TopPosts from 'components/data/query-top-posts/docs/example';

class DataComponents extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			filter: '',
		};
	}
	onSearch = term => {
		this.setState( { filter: trim( term || '' ).toLowerCase() } );
	};
	backToComponents() {
		page( '/devdocs/data/' );
	}
	render() {
		const { component } = this.props;
		const { filter } = this.state;
		const classes = 'devdocs docs-data';

		return (
			<Main className={ classes }>
				{ component
					? <HeaderCake onClick={ this.backToComponents } backText="All Components">
							{ slugToCamelCase( component ) }
						</HeaderCake>
					: <SearchCard
							onSearch={ this.onSearch }
							initialValue={ filter }
							placeholder="Search components…"
							analyticsGroup="Docs"
						/> }

				<Collection component={ component } filter={ filter } section="data">
					<TopPosts />
				</Collection>
			</Main>
		);
	}
}

export default DataComponents;
