/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Globals
 */
const noop = () => {};

export default class extends React.Component {
	static displayName = 'PostScheduleHeaderControls';

	static propTypes = {
		onYearChange: PropTypes.func,
	};

	static defaultProps = {
		onYearChange: noop,
	};

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
}
