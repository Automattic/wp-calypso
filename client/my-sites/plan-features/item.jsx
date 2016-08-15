/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';
import { abtest } from 'lib/abtest';

//export default function PlanFeaturesItem( { description, children, className } ) {
export default React.createClass( {

	displayName: 'PlanFeaturesItem',

	getInitialState() {
		return {
			showPopover: false
		};
	},

	renderTipinfo( description ) {
		return (
			<div className="plan-features__item-tip-info">
				<InfoPopover
					position="right"
					open = { this.state.showPopover }
				>
					{ description }
				</InfoPopover>
			</div>
		);
	},
	render() {
		const { description, children, className } = this.props;
		const classes = classNames( 'plan-features__item', className );
		let popoverBindings = {};
		if( abtest( 'plansDescriptions' ) === 'auto' ) {
			popoverBindings = {
				onMouseOver: () => this.setState( { showPopover: true } ),
				onMouseOut: () => this.setState( { showPopover: false } )
			};
		}

		return (
			<div { ...popoverBindings } className={ classes } >
				<Gridicon className="plan-features__item-checkmark" size={ 18 } icon="checkmark" />
				{ children }
				{ description && this.renderTipinfo( description ) }
			</div>
		);
	}
} );
