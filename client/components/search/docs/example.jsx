/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var DocsExample = require( 'components/docs-example' ),
	Search = require( 'components/search' ),
	SearchCard = require( 'components/search-card' );

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
				componentUsageStats={ this.props.componentUsageStats }
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
