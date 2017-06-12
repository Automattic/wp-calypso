/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ProgressIcon from './progress-icon';

export default class WizardBar extends React.Component {
	static defaultProps = {
		total: 100,
		color: '#006fb5',
	};

	static propTypes = {
		value: React.PropTypes.number.isRequired,
		total: React.PropTypes.number,
		color: React.PropTypes.string,
	};

	getCompletionPercentage() {
		const percentage = Math.ceil( this.props.value / this.props.total * 100 );

		// The percentage should not be allowed to be more than 100
		return Math.min( percentage, 100 );
	}

	renderBar() {
		const completionPercentage = this.getCompletionPercentage();
		const progressStyle = {
			width: completionPercentage + '%',
			backgroundColor: this.props.color,
		};
		const indicatorStyle = {
			width: completionPercentage === 0 ? '7px' : `${ completionPercentage }%`,
			marginLeft: completionPercentage === 0 ? '-4px' : 0,
		};

		return (
			<div>
				<div className="wizard-bar__progress" style={ progressStyle } />
				<div className="wizard-bar__indicator" style={ indicatorStyle }>
					{ <ProgressIcon color={ this.props.color } /> }
				</div>
			</div>
		);
	}

	render() {
		return (
			<div className="wizard-bar">
				{ this.renderBar() }
			</div>
		);
	}
}
