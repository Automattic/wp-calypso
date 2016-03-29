/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

const PlanHeader = React.createClass( {
	render: function() {
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
