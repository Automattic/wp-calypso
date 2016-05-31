/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const PlanHeaderRedesign = React.createClass( {

	render() {
		const { title, slug, price, billingTimeframe, current, popular } = this.props;

		return (
			<header className="plan-header--redesign">
				{ popular ?
					<div className="plan-header__popular-banner--redesign">{ 'Our most popular plan' }</div>
				: null }
				<div className={ `plan-header__figure--redesign is-${ slug }` }>
					{ current ? <Gridicon icon="checkmark-circle" /> : null }
				</div>
				<div className="plan-header__text--redesign">
					<h2 className="plan-header__title--redesign">{ title }</h2>
					<h2 className="plan-header__price--redesign">
						<sup className="plan-header__price__symbol--redesign">{ price.symbol }</sup>
						<span className="plan-header__price__major--redesign">{ price.major }</span>
						<sup className="plan-header__price__minor--redesign">{ price.minor }</sup>
					</h2>
					<p className="plan-header__timeframe--redesign">{ billingTimeframe }</p>
				</div>
			</header>
		);
	}

} );

export default PlanHeaderRedesign;
