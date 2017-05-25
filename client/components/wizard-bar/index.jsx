/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import ProgressIcon from './progress-icon';

export default class WizardBar extends React.Component {
	static defaultProps = {
		total: 100,
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
		const styles = { width: completionPercentage + '%' };
		if ( this.props.color ) {
			styles.backgroundColor = this.props.color;
		}

		return (
			<div>
				<div className="wizard-bar__progress" style={ styles } />
				<div
					className="wizard-bar__indicator"
					style={ { width: ( completionPercentage + 1 ) + '%' } }
				>
					{ <ProgressIcon /> }
				</div>
			</div>
		);
	}

	render() {
		const classes = classnames( this.props.className, 'wizard-bar' );
		return (
			<div className={ classes }>
				{ this.renderBar() }
			</div>
		);
	}
}
