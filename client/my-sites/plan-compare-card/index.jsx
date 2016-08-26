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
import Ribbon from 'components/ribbon';

export default React.createClass( {

	displayName: 'PlanCompareCard',

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
		};
	},

	buttonClick() {
		if ( ! this.props.currentPlan ) {
			this.props.onClick();
		}
	},

	render() {
		const classes = classNames( this.props.className, 'plan-compare-card' );
		const buttonClasses = classNames( 'plan-compare-card__button', {
			'is-current': this.props.currentPlan
		} );
		return (
			<div className={ classes } >
				{ this.props.popularRibbon && <Ribbon>{ this.translate( 'popular' ) }</Ribbon> }
				<Card className="plan-compare-card__header">
					<div className="plan-compare-card__title">{ this.props.title }</div>
					<div className="plan-compare-card__line">{ this.props.line }</div>
				</Card>
				<Card className="plan-compare-card__features">
					<ul className="plan-compare-card__features-list">
						{ this.props.children }
					</ul>
				</Card>
				<Card className="plan-compare-card__actions">
					<Button
						className={ buttonClasses }
						disabled={ this.props.currentPlan }
						primary={ ! this.props.currentPlan }
						onClick={ this.buttonClick }>
						{ this.props.currentPlan && <Gridicon className="plan-compare-card__button-checkmark" icon="checkmark" /> }
						{ this.props.buttonName }
					</Button>
				</Card>
			</div>
		);
	}
} );
