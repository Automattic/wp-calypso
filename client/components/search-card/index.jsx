/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var Card = require( 'components/card' ),
	Search = require( 'components/search' );

var SearchCard = React.createClass( {

	propTypes: {
		additionalClasses: React.PropTypes.string,
		initialValue: React.PropTypes.string,
		placeholder: React.PropTypes.string,
		delaySearch: React.PropTypes.bool,
		onSearch: React.PropTypes.func.isRequired,
		onSearchChange: React.PropTypes.func,
		analyticsGroup: React.PropTypes.string,
		autoFocus: React.PropTypes.bool,
		disabled: React.PropTypes.bool,
		dir: React.PropTypes.string
	},

	render: function() {
		return (
			<Card className="search-card">
				<Search ref="search" { ...this.props } />
			</Card>
		);
	},

	focus: function() {
		this.refs.search.focus();
	},

	clear: function() {
		this.refs.search.clear();
	}
} );

module.exports = SearchCard;
