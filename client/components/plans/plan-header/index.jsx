/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';
import noop from 'lodash/noop';

const PlanHeader = React.createClass( {
	propTypes: {
		isPlaceholder: React.PropTypes.bool,
		text: React.PropTypes.string,
		onClick: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			onClick: noop
		};
	},

	render() {
		const classes = classNames( {
			'plan-header': true,
			'is-placeholder': this.props.isPlaceholder
		} );

		return (
			<div className={ classes } onClick={ this.props.onClick } >
				<h2 className="plan-header__title">{ this.props.text }</h2>

				{ this.props.children }
			</div>
		);
	}
} );

export default PlanHeader;
