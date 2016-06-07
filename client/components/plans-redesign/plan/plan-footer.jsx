/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';

const PlanFooterRedesign = React.createClass( {

	render() {
		const { current, description } = this.props;

		return (
			<footer className="plan-footer--redesign">
				<p className="plan-footer__desc--redesign">{ description }</p>
				<div className="plan-footer__buttons--redesign">
					{
						current ?
							<Button className="plan-footer__button--redesign is-current" disabled><Gridicon size={ 18 } icon="checkmark" />{ 'Your plan' }</Button>
						: <Button className="plan-footer__button--redesign" primary>{ 'Upgrade' }</Button>
					}
				</div>
			</footer>
		);
	}

} );

export default PlanFooterRedesign;
