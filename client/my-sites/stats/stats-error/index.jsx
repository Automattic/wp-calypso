/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

export default React.createClass( {
	displayName: 'StatsModuleError',

	render() {
		let panelClassOptions = {};
		const message = this.props.message || this.translate( "Some stats didn't load in time. Please try again later." );

		panelClassOptions[ this.props.className ] = true;

		return (
			<div className={ classNames( 'module-content-text', 'is-error', panelClassOptions ) }>
				<p>{ message }</p>
			</div>
		);
	}
} );
