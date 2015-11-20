/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

/**
 * Globals
 */
var noop = () => {};

export default React.createClass( {
	propTypes: {
		onYearChange: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onYearChange: noop
		};
	},

	render() {
		return (
			<div className="post-schedule__year-controls">
				<button
					className="post-schedule__year-control-up"
					onClick={ () => {
						this.props.onYearChange( 1 );
					} }
				>
					<Gridicon icon="chevron-up" size={ 14 } />
				</button>

				<button
					className="post-schedule__year-control-down"
					onClick={ () => {
						this.props.onYearChange( -1 );
					} }
				>
					<Gridicon icon="chevron-down" size={ 14 } />
				</button>
			</div>
		);
	}
} );
