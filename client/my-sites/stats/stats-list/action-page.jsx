/**
 * External dependencies
 */
import debugFactory from 'debug';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';

const debug = debugFactory( 'calypso:stats:action-page' );

export default localize( React.createClass( {
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
				<a href="#" onClick={ this.clickHandler } className="module-content-list-item-action-wrapper" title={ this.props.translate( 'View in a new window', { textOnly: true, context: 'Stats action tooltip: View content in a new window' } ) } aria-label={ this.props.translate( 'View in a new window', { textOnly: true, context: 'Stats ARIA label: View content in a new window' } ) }>
					<Gridicon icon="stats" size={ 18 } />
					<span className="module-content-list-item-action-label">{ this.props.translate( 'View', { context: 'Stats: List item action to view content' } ) }</span>
				</a>
			</li>
		);
	}
} ) );
