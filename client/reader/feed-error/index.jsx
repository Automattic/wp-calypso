// External dependencies
var React = require( 'react' );

// Internal dependencies
var Main = require( 'components/main' ),
	MobileBackToSidebar = require( 'components/mobile-back-to-sidebar' ),
	EmptyContent = require( 'components/empty-content' );

var FeedError = React.createClass( {

	render: function() {
		return (
			<Main>
				<MobileBackToSidebar>
					<h1>{ this.props.listName }</h1>
				</MobileBackToSidebar>

				<EmptyContent
					title={ this.translate( 'Sorry. We can\'t find that stream.' ) }
					illustration={ '/calypso/images/drake/drake-404.svg' }
					illustrationWidth={ 500 }
				/>

			</Main>
		);
	}

} );

module.exports = FeedError;
