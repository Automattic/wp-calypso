import { getPlanClass, FEATURE_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { PlanFeaturesItem } from './item';

const Container = ( props ) => {
	const { children, isMobile, ...otherProps } = props;
	return isMobile ? (
		<div { ...otherProps }>{ children }</div>
	) : (
		<td { ...otherProps }>{ children }</td>
	);
};

export class PlanFeatures2023GridFeatures extends Component {
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
			<PlanFeaturesItem annualOnlyContent={ this.renderAnnualPlansFeatureNotice( feature ) }>
				<span className={ classes } key={ key }>
					<span className={ itemTitleClasses }>{ feature.getTitle( this.props.domainName ) }</span>
				</span>
			</PlanFeaturesItem>
		);
	}

	renderPlanFeatures( features, jpFeatures, planName, mapIndex ) {
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
				<div className="plan-features-2023-grid__jp-logo" key="jp-logo">
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

	render() {
		const { planProperties, isMobile } = this.props;

		return planProperties.map( ( properties, mapIndex ) => {
			const { planName, features, jpFeatures } = properties;

			return (
				<Container
					isMobile={ isMobile }
					key={ `${ planName }-${ mapIndex }` }
					className="plan-features-2023-grid__table-item"
				>
					{ this.renderPlanFeatures( features, jpFeatures, planName, mapIndex ) }
				</Container>
			);
		} );
	}
}

PlanFeatures2023GridFeatures.propTypes = {
	domainName: PropTypes.string,
	translate: PropTypes.func,
};

export default localize( PlanFeatures2023GridFeatures );
