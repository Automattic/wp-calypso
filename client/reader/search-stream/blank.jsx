const React = require( 'react' );

const EmptyContent = require( 'components/empty-content' );

const SearchBlankContent = React.createClass( {

	shouldComponentUpdate: function() {
		return false;
	},

	render: function() {
		return ( <EmptyContent
			title={ '' }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

module.exports = SearchBlankContent;
