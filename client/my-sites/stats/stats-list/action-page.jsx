/**
 * External dependencies
 */
var React = require( 'react' ),
	page = require( 'page' ),
	debug = require( 'debug' )( 'calypso:stats:action-page' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	Gridicon = require( 'gridicons' );

module.exports = React.createClass( {
	displayName: 'StatsActionPage',

	clickHandler: function( event ) {
		event.stopPropagation();
		event.preventDefault();
		debug( 'handling page click', this.props );
		analytics.ga.recordEvent( 'Stats', 'Clicked on Summary Link in ' + this.props.moduleName + ' List Action Menu' );

		page( this.props.page );
	},

	render: function() {
		return (
			<li className="module-content-list-item-action">
				<a href='#' onClick={ this.clickHandler } className="module-content-list-item-action-wrapper" title={ this.translate( 'View in a new window', { textOnly: true, context: 'Stats action tooltip: View content in a new window' } ) } aria-label={ this.translate( 'View in a new window', { textOnly: true, context: 'Stats ARIA label: View content in a new window' } ) }>
					<Gridicon icon="stats" size={ 18 } />
					<span className="module-content-list-item-action-label">{ this.translate( 'View', { context: 'Stats: List item action to view content' } ) }</span>
				</a>
			</li>
		);
	}
} );
