/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' );


module.exports = React.createClass( {
	displayName: 'CategorySelectorSearch',

	propTypes: {
		searchTerm: React.PropTypes.string,
		onSearch: React.PropTypes.func.isRequired
	},

	render: function() {
		return (
			<div className="category-selector__search">
				<Gridicon icon="search" size={ 18 } />
				<input type="search"
					placeholder={ this.translate( 'Search…', { textOnly: true } ) }
					value={ this.props.searchTerm }
					onChange={ this.props.onSearch } />
			</div>
		);
	}
} );
