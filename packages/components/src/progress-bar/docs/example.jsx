/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import ProgressBar from '..';

export default class extends PureComponent {
	static displayName = 'ProgressBar';

	state = {
		compact: false,
	};

	toggleCompact = () => {
		this.setState( { compact: ! this.state.compact } );
	};

	render() {
		const toggleText = this.state.compact ? 'Normal Bar' : 'Compact Bar';

		return (
			<div>
				<button className="docs__design-toggle button" onClick={ this.toggleCompact }>
					{ toggleText }
				</button>

				<ProgressBar value={ 0 } title="0% complete" compact={ this.state.compact } />
				<ProgressBar value={ 55 } total={ 100 } compact={ this.state.compact } />
				<ProgressBar value={ 100 } color="#1BABDA" compact={ this.state.compact } />
				<ProgressBar value={ 75 } compact={ this.state.compact } isPulsing />
			</div>
		);
	}
}
