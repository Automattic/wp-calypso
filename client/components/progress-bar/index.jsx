/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import ScreenReaderText from 'components/screen-reader-text';

export default class ProgressBar extends PureComponent {
	static defaultProps = {
		total: 100,
		compact: false,
		isPulsing: false
	};

	static propTypes = {
		value: PropTypes.number.isRequired,
		total: PropTypes.number,
		color: PropTypes.string,
		title: PropTypes.string,
		compact: PropTypes.bool,
		className: PropTypes.string,
		isPulsing: PropTypes.bool
	};

	getCompletionPercentage() {
		const percentage = Math.ceil( this.props.value / this.props.total * 100 );

		// The percentage should not be allowed to be more than 100
		return Math.min( percentage, 100 );
	}

	renderBar() {
		const title = this.props.title
			? <ScreenReaderText>{ this.props.title }</ScreenReaderText>
			: null;

		const styles = { width: this.getCompletionPercentage() + '%' };
		if ( this.props.color ) {
			styles.backgroundColor = this.props.color;
		}

		return <div className="progress-bar__progress" style={ styles } >{ title }</div>;
	}

	render() {
		const classes = classnames( this.props.className, 'progress-bar', {
			'is-compact': this.props.compact,
			'is-pulsing': this.props.isPulsing
		} );
		return (
			<div className={ classes }>
				{ this.renderBar() }
			</div>
		);
	}
}
