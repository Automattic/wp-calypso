const React = require( 'react' );

const EmptyContent = require( 'components/empty-content' );

const BlankContent = React.createClass( {

	shouldComponentUpdate: function() {
		return false;
	},

	render: function() {
		return ( <EmptyContent
			title={ '' }
			illustration={ '/calypso/images/drake/drake-404.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

module.exports = BlankContent;
