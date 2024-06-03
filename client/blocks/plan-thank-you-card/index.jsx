import { getPlan, getPlanClass } from '@automattic/calypso-products';
import { ProductIcon } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySites from 'calypso/components/data/query-sites';
import ThankYouCard from 'calypso/components/thank-you-card';
import getRawSite from 'calypso/state/selectors/get-raw-site';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';

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

	renderPlanIcon() {
		const { plan } = this.props;
		if ( ! plan || ! plan.productSlug ) {
			return null;
		}

		return <ProductIcon slug={ plan.productSlug } />;
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

		return translate( "Now that we've taken care of the plan, it's time to see your new site." );
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
		const description = this.renderDescription();

		return (
			<div className={ clsx( 'plan-thank-you-card', this.getPlanClass() ) }>
				<QuerySites siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />

				<ThankYouCard
					name={ this.renderPlanName() }
					heading={ this.renderHeading() }
					description={ 'string' === typeof description ? description : null }
					descriptionWithHTML={ 'object' === typeof description ? description : null }
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
	/**
	 * Description can be either a string or object to allow either a bare
	 * string or a description that contains HTML and other components.
	 */
	description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
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
