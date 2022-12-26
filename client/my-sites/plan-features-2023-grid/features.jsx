import {
	getPlanClass,
	FEATURE_CUSTOM_DOMAIN,
	PLAN_FREE,
	PLAN_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import BloombergLogo from 'calypso/assets/images/onboarding/bloomberg-logo.svg';
import CNNLogo from 'calypso/assets/images/onboarding/cnn-logo.svg';
import CondenastLogo from 'calypso/assets/images/onboarding/condenast-logo.svg';
import DisneyLogo from 'calypso/assets/images/onboarding/disney-logo.svg';
import FacebookLogo from 'calypso/assets/images/onboarding/facebook-logo.svg';
import SalesforceLogo from 'calypso/assets/images/onboarding/salesforce-logo.svg';
import SlackLogo from 'calypso/assets/images/onboarding/slack-logo.svg';
import TimeLogo from 'calypso/assets/images/onboarding/time-logo.svg';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { PlanFeaturesItem } from './item';

export class PlanFeatures2023GridFeatures extends Component {
	render() {
		return this.renderPlanFeatureColumns();
	}

	renderAnnualPlansFeatureNotice( feature ) {
		const { translate } = this.props;

		if ( ! feature.availableOnlyForAnnualPlans || feature.availableForCurrentPlan ) {
			return '';
		}

		return (
			<span className="plan-features-2023-grid__item-annual-plan">
				{ translate( 'Included with annual plans' ) }
			</span>
		);
	}

	renderFeatureItem( feature, index, key = null ) {
		const classes = classNames( 'plan-features-2023-grid__item-info', {
			'is-annual-plan-feature': feature.availableOnlyForAnnualPlans,
			'is-available': feature.availableForCurrentPlan,
		} );

		const itemTitleClasses = classNames( 'plan-features-2023-grid__item-title', {
			'is-bold': feature.getSlug() === FEATURE_CUSTOM_DOMAIN,
		} );
		return (
			<PlanFeaturesItem
				key={ key }
				annualOnlyContent={ this.renderAnnualPlansFeatureNotice( feature ) }
				isFeatureAvailable={ feature.availableForCurrentPlan }
			>
				<span className={ classes } key={ key }>
					<span className={ itemTitleClasses }>{ feature.getTitle( this.props.domainName ) }</span>
				</span>
			</PlanFeaturesItem>
		);
	}

	renderEnterpriseClientLogos() {
		return (
			<div className="plan-features-2023-grid__item plan-features-2023-grid__enterprise-logo">
				<img src={ TimeLogo } alt="WordPress VIP client logo for TIME" loading="lazy" />
				<img src={ SlackLogo } alt="WordPress VIP client logo for Slack" loading="lazy" />
				<img src={ DisneyLogo } alt="WordPress VIP client logo for Disney" loading="lazy" />
				<img src={ CNNLogo } alt="WordPress VIP client logo for CNN" loading="lazy" />
				<img src={ SalesforceLogo } alt="WordPress VIP client logo for Salesforce" loading="lazy" />
				<img src={ FacebookLogo } alt="WordPress VIP client logo for Facebook" loading="lazy" />
				<img src={ CondenastLogo } alt="WordPress VIP client logo for Conde Nast" loading="lazy" />
				<img src={ BloombergLogo } alt="WordPress VIP client logo for Bloomberg" loading="lazy" />
			</div>
		);
	}

	renderPlanFeatures( features, jpFeatures, planName, mapIndex ) {
		if ( PLAN_ENTERPRISE_GRID_WPCOM === planName ) {
			return this.renderEnterpriseClientLogos();
		}

		const featureItemJSX = features.map( ( currentFeature, featureIndex ) => {
			const classes = classNames( '', getPlanClass( planName ), {
				'is-last-feature': featureIndex + 1 === features.length,
			} );
			const key = `${ currentFeature.getSlug() }-${ featureIndex }`;

			return (
				<div key={ key } className={ classes }>
					{ this.renderFeatureItem( currentFeature, mapIndex, key ) }
				</div>
			);
		} );

		jpFeatures.length !== 0 &&
			featureItemJSX.push(
				<div className="plan-features-2023-grid__jp-logo">
					<JetpackLogo size={ 16 } />
				</div>
			);

		featureItemJSX.push(
			jpFeatures.map( ( currentFeature, featureIndex ) => {
				const classes = classNames( '', getPlanClass( planName ), {
					'is-last-feature': featureIndex + 1 === features.length,
					'is-bold': currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN,
				} );
				const key = `${ currentFeature.getSlug() }-jp-${ featureIndex }`;

				return (
					<div key={ key } className={ classes }>
						{ this.renderFeatureItem( currentFeature, mapIndex, key ) }
					</div>
				);
			} )
		);

		return featureItemJSX;
	}

	renderPlanFeatureColumns() {
		const { planProperties } = this.props;
		let previousPlanName = 'Free';
		let currentPlanName = 'Free';

		return planProperties.map( ( properties, mapIndex ) => {
			const { planName, features, jpFeatures, product_name_short } = properties;
			previousPlanName = currentPlanName;
			currentPlanName = product_name_short;
			const planFeatureTitle = [ PLAN_FREE, PLAN_ENTERPRISE_GRID_WPCOM ].includes( planName )
				? ''
				: `Everything in ${ previousPlanName }, plus:`;
			const classes = classNames(
				'plan-features-2023-grid__item',
				'plan-features-2023-grid__common-title',
				getPlanClass( planName )
			);

			return (
				<td key={ `${ planName }-${ mapIndex }` } className="plan-features-2023-grid__table-item">
					<div className={ classes }>{ mapIndex === 0 ? <>&nbsp;</> : planFeatureTitle }</div>
					{ this.renderPlanFeatures( features, jpFeatures, planName, mapIndex ) }
				</td>
			);
		} );
	}
}

PlanFeatures2023GridFeatures.propTypes = {
	domainName: PropTypes.string,
	translate: PropTypes.func,
};

export default localize( PlanFeatures2023GridFeatures );
