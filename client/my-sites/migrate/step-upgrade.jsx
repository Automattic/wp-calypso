import {
	getPlan,
	PLAN_ECOMMERCE_TRIAL_MONTHLY,
	PLAN_BUSINESS,
	PLAN_WOOEXPRESS_SMALL,
} from '@automattic/calypso-products';
import { CompactCard, ProductIcon, Gridicon, PlanPrice } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import QueryPlans from 'calypso/components/data/query-plans';
import HeaderCake from 'calypso/components/header-cake';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlanRawPrice } from 'calypso/state/plans/selectors';
import MigrateButton from './migrate-button.jsx';

import './section-migrate.scss';

class StepUpgrade extends Component {
	static propTypes = {
		plugins: PropTypes.array.isRequired,
		sourceSite: PropTypes.object.isRequired,
		startMigration: PropTypes.func.isRequired,
		targetSite: PropTypes.object.isRequired,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_site_migration_business_viewed' );
	}

	render() {
		const {
			billingTimeFrame,
			currency,
			planPrice,
			plugins,
			sourceSite,
			sourceSiteSlug,
			targetSite,
			targetSiteSlug,
			themes,
			translate,
		} = this.props;
		const sourceSiteDomain = get( sourceSite, 'domain' );
		const targetSiteDomain = get( targetSite, 'domain' );
		const backHref = `/migrate/from/${ sourceSiteSlug }/to/${ targetSiteSlug }`;
		const currentPlanSlug = get( targetSite, 'plan.product_slug' );
		const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
		const upsellPlanName = isEcommerceTrial
			? getPlan( PLAN_WOOEXPRESS_SMALL )?.getTitle()
			: getPlan( PLAN_BUSINESS )?.getTitle();

		return (
			<>
				<QueryPlans />
				<HeaderCake backHref={ backHref }>{ translate( 'Import Everything' ) }</HeaderCake>

				<CompactCard>
					<CardHeading>
						{
							// translators: %(upsellPlanName)s is the name of the Creator/Business/Essential plan
							translate( 'A %(upsellPlanName)s Plan is required to import everything.', {
								args: { upsellPlanName: upsellPlanName },
							} )
						}
					</CardHeading>
					<div>
						{ translate(
							'To import your themes, plugins, users, and settings from %(sourceSiteDomain)s we need to upgrade your WordPress.com site.',
							{
								args: { sourceSiteDomain },
							}
						) }
					</div>
					<div className="migrate__plan-upsell">
						{ /** The child elements here are in reverse order due to having flex-direction: row-reverse in CSS */ }
						<div className="migrate__plan-upsell-plugins">
							<h4 className="migrate__plan-feature-header">
								{ translate( 'Your active plugins' ) }
							</h4>
							{ plugins.slice( 0, 2 ).map( ( plugin, index ) => (
								<div className="migrate__plan-upsell-item" key={ index }>
									<Gridicon size={ 18 } icon="checkmark" />
									<div className="migrate__plan-upsell-item-label">{ plugin.name }</div>
								</div>
							) ) }
							{ plugins.length > 2 && (
								<div className="migrate__plan-upsell-item">
									<Gridicon size={ 18 } icon="plus" />
									<div className="migrate__plan-upsell-item-label">
										{ translate( '%(number)d more', { args: { number: plugins.length - 2 } } ) }
									</div>
								</div>
							) }
						</div>
						<div className="migrate__plan-upsell-themes">
							<h4 className="migrate__plan-feature-header">
								{ translate( 'Your custom themes' ) }
							</h4>
							{ themes.slice( 0, 2 ).map( ( theme, index ) => (
								<div className="migrate__plan-upsell-item" key={ index }>
									<Gridicon size={ 18 } icon="checkmark" />
									<div className="migrate__plan-upsell-item-label">{ theme.name }</div>
								</div>
							) ) }
							{ themes.length > 2 && (
								<div className="migrate__plan-upsell-item">
									<Gridicon size={ 18 } icon="plus" />
									<div className="migrate__plan-upsell-item-label">
										{ translate( '%(number)d more', { args: { number: themes.length - 2 } } ) }
									</div>
								</div>
							) }
						</div>
						<div className="migrate__plan-upsell-container">
							<div className="migrate__plan-upsell-icon">
								<ProductIcon slug="business-bundle" />
							</div>
							<div className="migrate__plan-upsell-info">
								<div className="migrate__plan-name">
									{
										// translators: %(planName)s is the name of the Creator/Business/Essential plan
										translate( 'WordPress.com %(planName)s', {
											args: { planName: upsellPlanName },
										} )
									}
								</div>
								<div className="migrate__plan-price">
									<PlanPrice rawPrice={ planPrice } currencyCode={ currency } />
								</div>
								<div className="migrate__plan-billing-time-frame">{ billingTimeFrame }</div>
							</div>
						</div>
					</div>
					<MigrateButton
						onClick={ this.props.startMigration }
						targetSiteDomain={ targetSiteDomain }
					>
						{ translate( 'Upgrade and import' ) }
					</MigrateButton>
				</CompactCard>
			</>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const { targetSite } = ownProps;
		const currentPlanSlug = get( targetSite, 'plan.product_slug' );
		const isEcommerceTrial = currentPlanSlug === PLAN_ECOMMERCE_TRIAL_MONTHLY;
		const plan = isEcommerceTrial ? getPlan( PLAN_WOOEXPRESS_SMALL ) : getPlan( PLAN_BUSINESS );
		const planId = plan.getProductId();
		return {
			billingTimeFrame: plan.getBillingTimeFrame(),
			currency: getCurrentUserCurrencyCode( state ),
			planPrice: getPlanRawPrice( state, planId, true ),
		};
	},
	{ recordTracksEvent }
)( localize( StepUpgrade ) );
