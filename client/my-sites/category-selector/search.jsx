/**
 * External dependencies
 */
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'CategorySelectorSearch',

	propTypes: {
		searchTerm: React.PropTypes.string,
		onSearch: React.PropTypes.func.isRequired
	},

	render: function() {
		return (
			<div className="category-selector__search">
				<div className="noticon noticon-search" />
				<input type="search"
					placeholder={ this.translate( 'Search…', { textOnly: true } ) }
					value={ this.props.searchTerm }
					onChange={ this.props.onSearch } />
			</div>
		);
	}
} );
