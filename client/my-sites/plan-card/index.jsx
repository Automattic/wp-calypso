/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { PropTypes } from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */

import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'components/gridicon';

export default React.createClass( {

	displayName: 'PlanCard',

	propTypes: {
		className: PropTypes.string,
		onClick: PropTypes.func,
		title: PropTypes.string.isRequired,
		line: PropTypes.string.isRequired,
		buttonName: PropTypes.string.isRequired,
		currentPlan: PropTypes.bool,
		popularRibbon: PropTypes.bool
	},

	getDefaultProps() {
		return {
			onClick: noop,
			currentPlan: true,
			popularRibbon: false
		}
	},

	buttonClick() {
		if ( ! this.props.currentPlan ) {
			this.props.onClick();
		}
	},

	render() {
		const classes = classNames( this.props.className, 'plan-card' );
		const buttonClasses = classNames( 'plan-card__button', {
			'is-current': this.props.currentPlan
		} );
		return (
			<div className={ classes } >
				{ this.props.popularRibbon && <div className="plan-card__ribbon">
					<span className="plan-card__ribbon-title">{ this.translate( 'popular' ) }</span>
				</div> }
				<Card className="plan-card__header">
					<div className="plan-card__title">{ this.props.title }</div>
					<div className="plan-card__line">{ this.props.line }</div>
				</Card>
				<Card className="plan-card__features">
					<ul className="plan-card__features-list">
						{ this.props.children }
					</ul>
				</Card>
				<Card className="plan-card__actions">
					<Button
						className={ buttonClasses }
						disabled={ this.props.currentPlan }
						primary={ ! this.props.currentPlan }
						onClick={ this.buttonClick }>
						{ this.props.currentPlan && <Gridicon className="plan-card__button-checkmark" icon="checkmark" /> }
						{ this.props.buttonName }
					</Button>
				</Card>
			</div>
		);
	}
} );
