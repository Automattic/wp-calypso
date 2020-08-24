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
import { recordTracksEvent } from 'state/analytics/actions';

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

		return (
			<>
				<QueryPlans />
				<HeaderCake backHref={ backHref }>{ translate( 'Import Everything' ) }</HeaderCake>

				<CompactCard>
					<CardHeading>
						{ translate( 'A Business Plan is required to import everything.' ) }
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
								<div className="migrate__plan-name">{ translate( 'WordPress.com Business' ) }</div>
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
	( state ) => {
		const plan = getPlan( PLAN_BUSINESS );
		const planId = plan.getProductId();

		return {
			billingTimeFrame: plan.getBillingTimeFrame(),
			currency: getCurrentUserCurrencyCode( state ),
			planPrice: getPlanRawPrice( state, planId, true ),
		};
	},
	{ recordTracksEvent }
)( localize( StepUpgrade ) );
