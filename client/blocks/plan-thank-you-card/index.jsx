/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classnames from 'classnames';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import getRawSite from 'state/selectors/get-raw-site';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlan, getPlanClass } from 'lib/plans';
import ThankYouCard from 'components/thank-you-card';
import PlanIcon from 'components/plans/plan-icon';

/**
 * Style dependencies
 */
import './style.scss';

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
			args: { planName: getPlan( plan.productSlug ).getTitle() },
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
		const { description, descriptionWithHTML, translate } = this.props;
		if ( description ) {
			return description;
		}

		if ( descriptionWithHTML ) {
			// If there is a descriptionWithHTML, we shouldn't render a default description
			return null;
		}

		return translate( "Now that we've taken care of the plan, it's time to see your new site." );
	}

	renderDescriptionWithHTML() {
		const { descriptionWithHTML } = this.props;
		if ( descriptionWithHTML ) {
			return descriptionWithHTML;
		}

		return null;
	}

	renderHeading() {
		const { heading, translate } = this.props;
		if ( heading ) {
			return heading;
		}

		return translate( 'Thank you for your purchase!' );
	}

	renderButtonText() {
		const { buttonText, translate } = this.props;
		if ( buttonText ) {
			return buttonText;
		}

		return translate( 'Visit Your Site' );
	}

	getButtonUrl() {
		const { buttonUrl, siteUrl } = this.props;
		if ( buttonUrl ) {
			return buttonUrl;
		}

		return siteUrl;
	}

	render() {
		const { siteId } = this.props;
		return (
			<div className={ classnames( 'plan-thank-you-card', this.getPlanClass() ) }>
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />

				<ThankYouCard
					name={ this.renderPlanName() }
					price={ this.renderPlanPrice() }
					heading={ this.renderHeading() }
					description={ this.renderDescription() }
					descriptionWithHTML={ this.renderDescriptionWithHTML() }
					buttonUrl={ this.getButtonUrl() }
					buttonText={ this.renderButtonText() }
					icon={ this.renderPlanIcon() }
					action={ this.renderAction() }
				/>
			</div>
		);
	}
}

PlanThankYouCard.propTypes = {
	action: PropTypes.node,
	buttonText: PropTypes.string,
	buttonUrl: PropTypes.string,
	description: PropTypes.string,
	descriptionWithHTML: PropTypes.object,
	heading: PropTypes.string,
	plan: PropTypes.object,
	siteId: PropTypes.number.isRequired,
	siteUrl: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default connect( ( state, ownProps ) => {
	const site = getRawSite( state, ownProps.siteId );
	const plan = getCurrentPlan( state, ownProps.siteId );

	return {
		plan,
		siteUrl: site && site.URL,
	};
} )( localize( PlanThankYouCard ) );
