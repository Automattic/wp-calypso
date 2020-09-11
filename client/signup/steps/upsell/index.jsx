/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import UpsellForm from './form';
import StepWrapper from 'signup/step-wrapper';
import { getDomainPrice, getDomainSalePrice } from 'lib/domains';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getProductsList } from 'state/products-list/selectors';
import { getPlanRawPrice } from 'state/plans/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class Upsell extends Component {
	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	render() {
		const { flowName, positionInFlow, stepName } = this.props;

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				stepContent={ this.renderStepContent() }
				hideBack={ true }
			/>
		);
	}

	renderStepContent() {
		const {
			productCost,
			productSaleCost,
			domainName,
			planRawPrice,
			currentUserCurrencyCode,
		} = this.props;
		const domainPrice = productSaleCost || productCost;
		const planPrice = formatCurrency( planRawPrice, currentUserCurrencyCode, { precision: 0 } );

		return (
			<Fragment>
				<UpsellForm
					submitForm={ this.submitStep }
					domainPrice={ domainPrice }
					domainName={ domainName }
					planPrice={ planPrice }
				/>
			</Fragment>
		);
	}

	submitStep = ( type ) => {
		const { stepName } = this.props;

		if ( type === 'decline' ) {
			this.props.submitSignupStep( { stepName } );
			this.props.submitSignupStep(
				{ stepName: 'domains', domainItem: undefined },
				{ domainItem: undefined }
			);
		} else if ( type === 'accept' ) {
			this.props.submitSignupStep( { stepName } );
		}

		this.props.recordTracksEvent( `calypso_plan_for_custom_domain_${ type }_button_click` );

		this.props.goToNextStep();
	};
}

const mapStateToProps = ( state, props ) => {
	const domainItem = get( props, 'signupDependencies.domainItem' );
	const productSlug = get( domainItem, 'product_slug' );
	const domainName = get( domainItem, 'meta' );
	const productsList = getProductsList( state );
	const currentUserCurrencyCode = getCurrentUserCurrencyCode( state );
	const stripZeros = true;

	// Get monthly price of the Personal plan
	const personalPlanProductId = 1009;
	const showMonthlyPrice = true;

	return {
		productCost: getDomainPrice( productSlug, productsList, currentUserCurrencyCode, stripZeros ),
		productSaleCost: getDomainSalePrice(
			productSlug,
			productsList,
			currentUserCurrencyCode,
			stripZeros
		),
		domainName,
		planRawPrice: getPlanRawPrice( state, personalPlanProductId, showMonthlyPrice ),
		currentUserCurrencyCode,
	};
};

export default connect( mapStateToProps, { saveSignupStep, submitSignupStep, recordTracksEvent } )(
	localize( Upsell )
);
