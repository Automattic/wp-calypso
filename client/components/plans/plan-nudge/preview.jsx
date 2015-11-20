/**
* External dependencies
*/
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

export default React.createClass( {
	displayName: 'PlanPreview',

	propTypes: {
		plan: React.PropTypes.object.isRequired,
		action: React.PropTypes.func,
		actionLabel: React.PropTypes.string,
	},

	renderAction: function() {
		if ( ! this.props.action ) {
			return null;
		}

		return (
			<div className='plan-preview__action'>
				<button className='button' onClick={ this.props.action }>
					{ this.props.actionLabel }
				</button>
			</div>
		);
	},

	render: function() {
		var planClasses = classNames( 'plan-preview', this.props.plan.product_slug );

		return (
			<div className={ planClasses }>
				<div className='plan-preview__header'>
					<h4 className='plan-preview__title'>
						{ this.props.plan.product_name_short }
					</h4>
					<div className='price'>
						{ this.props.plan.price }
						<span className='bill-period'>
							{ this.props.plan.bill_period_label }
						</span>
					</div>
				</div>
				<div className='plan-preview__description'>
					{ this.props.plan.shortdesc }
				</div>
				{ this.renderAction() }
			</div>
		);
	}
} );
