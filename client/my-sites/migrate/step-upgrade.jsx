/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { CompactCard, ProductIcon } from '@automattic/components';

/**
 * Internal dependencies
 */
import CardHeading from 'components/card-heading';
import Gridicon from 'components/gridicon';
import HeaderCake from 'components/header-cake';
import MigrateButton from './migrate-button.jsx';
import PlanPrice from 'my-sites/plan-price';
import QueryPlans from 'components/data/query-plans';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPlan } from 'lib/plans';
import { getPlanRawPrice } from 'state/plans/selectors';
import { PLAN_BUSINESS } from 'lib/plans/constants';

/**
 * Style dependencies
 */
import './section-migrate.scss';

class StepUpgrade extends Component {
	static propTypes = {
		plugins: PropTypes.array.isRequired,
		sourceSite: PropTypes.object.isRequired,
		startMigration: PropTypes.func.isRequired,
		targetSite: PropTypes.object.isRequired,
	};

	render() {
		const {
			billingTimeFrame,
			currency,
			planPrice,
			plugins,
			sourceSite,
			targetSite,
			themes,
		} = this.props;
		const sourceSiteDomain = get( sourceSite, 'domain' );
		const targetSiteDomain = get( targetSite, 'domain' );

		return (
			<>
				<QueryPlans />
				<HeaderCake>Import Everything</HeaderCake>

				<CompactCard>
					<CardHeading>A Business Plan is required to import everything.</CardHeading>
					<div>
						To import your themes, plugins, users, and settings from { sourceSiteDomain } we need to
						upgrade your WordPress.com site.
					</div>
					<div className="migrate__plan-upsell">
						<div className="migrate__plan-upsell-icon">
							<ProductIcon slug="business-bundle" />
						</div>
						<div className="migrate__plan-upsell-info">
							<div className="migrate__plan-name">WordPress.com Business</div>
							<div className="migrate__plan-price">
								<PlanPrice rawPrice={ planPrice } currency={ currency } />
							</div>
							<div className="migrate__plan-billing-time-frame">{ billingTimeFrame }</div>
						</div>
						<div className="migrate__plan-upsell-themes">
							<h4 className="migrate__plan-feature-header">Your custom themes</h4>
							{ themes.slice( 0, 2 ).map( theme => (
								<div className="migrate__plan-upsell-item">
									<Gridicon size={ 18 } icon="checkmark" />
									<div className="migrate__plan-upsell-item-label">{ theme.name }</div>
								</div>
							) ) }
							{ themes.length > 2 && (
								<div className="migrate__plan-upsell-item">
									<Gridicon size={ 18 } icon="plus" />
									<div className="migrate__plan-upsell-item-label">{ themes.length - 2 } more</div>
								</div>
							) }
						</div>
						<div className="migrate__plan-upsell-plugins">
							<h4 className="migrate__plan-feature-header">Your active plugins</h4>
							{ plugins.slice( 0, 2 ).map( plugin => (
								<div className="migrate__plan-upsell-item">
									<Gridicon size={ 18 } icon="checkmark" />
									<div className="migrate__plan-upsell-item-label">{ plugin.name }</div>
								</div>
							) ) }
							{ plugins.length > 2 && (
								<div className="migrate__plan-upsell-item">
									<Gridicon size={ 18 } icon="plus" />
									<div className="migrate__plan-upsell-item-label">{ plugins.length - 2 } more</div>
								</div>
							) }
						</div>
					</div>
					<MigrateButton
						onClick={ this.props.startMigration }
						targetSiteDomain={ targetSiteDomain }
					>
						Upgrade and import
					</MigrateButton>
				</CompactCard>
			</>
		);
	}
}

export default connect( state => {
	const plan = getPlan( PLAN_BUSINESS );
	const planId = plan.getProductId();

	return {
		billingTimeFrame: plan.getBillingTimeFrame(),
		currency: getCurrentUserCurrencyCode( state ),
		planPrice: getPlanRawPrice( state, planId, true ),
	};
} )( localize( StepUpgrade ) );
