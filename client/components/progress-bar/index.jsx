/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

module.exports = React.createClass( {

	displayName: 'ProgressBar',

	getDefaultProps() {
		return {
			total: 100,
			compact: false,
			isPulsing: false
		};
	},

	propTypes: {
		value: React.PropTypes.number.isRequired,
		total: React.PropTypes.number,
		color: React.PropTypes.string,
		title: React.PropTypes.string,
		compact: React.PropTypes.bool,
		className: React.PropTypes.string,
		isPulsing: React.PropTypes.bool
	},

	renderBar() {
		const title = this.props.title
				? <span className="screen-reader-text">{ this.props.title }</span>
				: null;

		let styles = { width: Math.ceil( this.props.value / this.props.total * 100 ) + '%' };
		if ( this.props.color ) {
			styles.backgroundColor = this.props.color;
		}

		return <div className="progress-bar__progress" style={ styles } >{ title }</div>;
	},

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
} );
