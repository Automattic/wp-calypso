import { Gridicon } from '@automattic/components';
import PropTypes from 'prop-types';
import { Component } from 'react';

/**
 * Globals
 */
const noop = () => {};

export default class extends Component {
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
					{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
					<Gridicon icon="chevron-up" size={ 14 } />
				</button>

				<button
					className="post-schedule__year-control-down"
					onClick={ () => {
						this.props.onYearChange( -1 );
					} }
				>
					{ /* eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
					<Gridicon icon="chevron-down" size={ 14 } />
				</button>
			</div>
		);
	}
}
