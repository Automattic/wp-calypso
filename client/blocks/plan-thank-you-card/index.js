/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlan } from 'lib/plans';
import formatCurrency from 'lib/format-currency';
import ThankYouCard from 'components/thank-you-card';
import PlanIcon from 'components/plans/plan-icon';
import { getPlanClass } from 'lib/plans/constants';

class PlanThankYouCard extends Component {
	getPlanClass() {
		const { plan } = this.props;
		if ( ! plan || ! plan.productSlug ) {
			return '';
		}

		return getPlanClass( plan.productSlug );
	}

	renderPlanName() {
		const { plan, translate } = this.props;
		if ( ! plan ) {
			return '';
		}

		return translate( '%(planName)s Plan', {
			args: { planName: getPlan( plan.productSlug ).getTitle() }
		} );
	}

	renderPlanPrice() {
		const { plan } = this.props;
		if ( ! plan || ! plan.rawPrice || ! plan.currencyCode ) {
			return '';
		}

		return formatCurrency( plan.rawPrice, plan.currencyCode );
	}

	renderPlanIcon() {
		const { plan } = this.props;
		if ( ! plan || ! plan.productSlug ) {
			return null;
		}

		return <PlanIcon plan={ plan.productSlug } />;
	}

	renderAction() {
		const { action } = this.props;
		if ( action ) {
			return action;
		}

		return null;
	}

	renderDescription() {
		const { description, translate } = this.props;
		if ( description ) {
			return description;
		}

		return translate(
			"Now that we've taken care of the plan, it's time to see your new site."
		);
	}

	render() {
		const { siteUrl, siteId, translate } = this.props;
		return (
			<div className={ classnames( 'plan-thank-you-card', this.getPlanClass() ) }>
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />

				<ThankYouCard
					name={ this.renderPlanName() }
					price={ this.renderPlanPrice() }
					heading={ translate( 'Thank you for your purchase!' ) }
					description={ this.renderDescription() }
					buttonUrl={ siteUrl }
					buttonText={ translate( 'Visit Your Site' ) }
					icon={ this.renderPlanIcon() }
					action={ this.renderAction() }
				/>
			</div>
		);
	}
}

PlanThankYouCard.propTypes = {
	plan: PropTypes.object,
	siteId: PropTypes.number.isRequired,
	siteUrl: PropTypes.string,
	translate: PropTypes.func.isRequired,
	action: PropTypes.node,
	description: PropTypes.string
};

export default connect( ( state, ownProps ) => {
	const site = getRawSite( state, ownProps.siteId );
	const plan = getCurrentPlan( state, ownProps.siteId );

	return {
		plan,
		siteUrl: site && site.URL
	};
} )( localize( PlanThankYouCard ) );
