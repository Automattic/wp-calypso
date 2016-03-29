/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

const PlanHeader = React.createClass( {
	propTypes: {
		isPlaceholder: React.PropTypes.bool,
		text: React.PropTypes.string
	},

	render() {
		const classes = classNames( {
			'plan-header': true,
			'is-placeholder': this.props.isPlaceholder
		} );

		return (
			<div className={ classes }>
				<h2 className="plan-header__title">{ this.props.text }</h2>

				{ this.props.children }
			</div>
		);
	}
} );

export default PlanHeader;
