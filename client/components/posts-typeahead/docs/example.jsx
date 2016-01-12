/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import PostsTypeahead from '../';

class PostsTypeaheadExample extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			search: ''
		};
	}

	shouldComponentUpdate( nextProps, nextState ) {
		return nextState.search !== this.state.search;
	}

	render() {
		const onSearch = ( search ) => {
			this.setState( { search } );
		};

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/posts-typeahead">Posts Typeahead</a>
				</h2>
				<PostsTypeahead
					siteId={ 3584907 }
					search={ this.state.search }
					onSearch={ onSearch } />
			</div>
		);
	}
}

PostsTypeaheadExample.displayName = 'PostsTypeahead';

export default PostsTypeaheadExample;
