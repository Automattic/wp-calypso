/**
 * External dependencies
 */

import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { noop } from 'lodash';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */

import { Button, Card, Ribbon } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class PlanCompareCard extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		onClick: PropTypes.func,
		title: PropTypes.string.isRequired,
		line: PropTypes.string.isRequired,
		buttonName: PropTypes.string.isRequired,
		currentPlan: PropTypes.bool,
		popularRibbon: PropTypes.bool,
	};

	static defaultProps = {
		onClick: noop,
		currentPlan: true,
		popularRibbon: false,
	};

	buttonClick = () => {
		if ( ! this.props.currentPlan ) {
			this.props.onClick();
		}
	};

	render() {
		const classes = classNames( this.props.className, 'plan-compare-card' );
		const buttonClasses = classNames( 'plan-compare-card__button', {
			'is-current': this.props.currentPlan,
		} );
		return (
			<div className={ classes }>
				{ this.props.popularRibbon && <Ribbon>{ this.props.translate( 'popular' ) }</Ribbon> }
				<Card className="plan-compare-card__header">
					<div className="plan-compare-card__title">{ this.props.title }</div>
					<div className="plan-compare-card__line">{ this.props.line }</div>
				</Card>
				<Card className="plan-compare-card__features">
					<ul className="plan-compare-card__features-list">{ this.props.children }</ul>
				</Card>
				<Card className="plan-compare-card__actions">
					<Button
						className={ buttonClasses }
						disabled={ this.props.currentPlan }
						primary={ ! this.props.currentPlan }
						onClick={ this.buttonClick }
					>
						{ this.props.currentPlan && (
							<Gridicon className="plan-compare-card__button-checkmark" icon="checkmark" />
						) }
						{ this.props.buttonName }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( PlanCompareCard );
