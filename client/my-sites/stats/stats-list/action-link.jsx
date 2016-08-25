/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatsActionLink',

	clickHandler: function( event ) {
		event.stopPropagation();
		event.preventDefault();
		analytics.ga.recordEvent( 'Stats', 'Clicked on External Link in ' + this.props.moduleName + ' List Action Menu' );
		window.open( this.props.href );
	},

	render: function() {
		return (
			<li className='module-content-list-item-action'>
				<a href={ this.props.href } onClick={ this.clickHandler } target="_blank" rel="noopener noreferrer" className='module-content-list-item-action-wrapper' title={ this.translate( 'View content in a new window', { textOnly: true, context: 'Stats action tooltip: View content in a new window' } ) } aria-label={ this.translate( 'View content in a new window', { textOnly: true, context: 'Stats ARIA label: View content in new window action' } ) } >
					<Gridicon icon="external" size={ 18 } />
					<span className='module-content-list-item-action-label module-content-list-item-action-label-view'>{ this.translate( 'View', { context: 'Stats: List item action to view content' } ) }</span>
				</a>
			</li>
		);
	}
} );
