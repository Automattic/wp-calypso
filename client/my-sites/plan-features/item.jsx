/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';
import { abtest } from 'lib/abtest';

export default class PlanFeaturesItem extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			showPopover: false,
			mouseOverTimeout: null,
			mouseOver: false
		};
		this.mouseOver = this.mouseOver.bind( this );
		this.mouseOut = this.mouseOut.bind( this );
	}

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
	}
	mouseOver() {
		this.setState( { mouseOver: true, mouseOverTimeout: setTimeout( () => this.setState( {
			showPopover: this.state.mouseOver,
			mouseOverTimeout: null
		} ), 100 ) } );
	}
	mouseOut() {
		clearTimeout( this.state.mouseOverTimeout );
		this.setState( { showPopover: false, mouseOverTimeout: null, mouseOver: false } );
	}
	render() {
		const { description, children, className } = this.props;
		const classes = classNames( 'plan-features__item', className );
		let popoverBindings = {};
		if ( abtest( 'plansDescriptions' ) === 'auto' ) {
			popoverBindings = {
				onMouseOver: this.mouseOver,
				onMouseOut: this.mouseOut
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
}
