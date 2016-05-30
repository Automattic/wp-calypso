/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import DocsExample from 'components/docs-example';
import Search from 'components/search';
import SearchCard from 'components/search-card';

/**
 * Globals
 */
var noop = () => {};

var SearchDemo = React.createClass( {
	displayName: 'Search',

	mixins: [ PureRenderMixin ],

	render: function() {
		return (
			<DocsExample
				title="Search"
				url="/devdocs/design/search"
				componentUsageStats={ this.props.getUsageStats( Search ) }
			>
				<Search
					onSearch={ noop }
					placeholder="Placeholder text..."
				/>
				<h2>Search Card</h2>
				<SearchCard
					onSearch={ noop }
					placeholder="Placeholder text..."
				/>
			</DocsExample>
		);
	}
} );

module.exports = SearchDemo;
