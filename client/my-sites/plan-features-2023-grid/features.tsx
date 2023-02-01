import { getPlanClass, FEATURE_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize, useTranslate } from 'i18n-calypso';
import { PlanFeaturesItem } from './item';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import { TransformedFeatureObject } from './types';

const PlanFeatures2023GridFeatures: React.FC< {
	features: Array< TransformedFeatureObject >;
	planName: string;
	domainName: string;
} > = ( { features, planName, domainName } ) => {
	const translate = useTranslate();
	const annualPlansFeatureNotice = ( feature: TransformedFeatureObject ) => {
		if ( ! feature.availableOnlyForAnnualPlans || feature.availableForCurrentPlan ) {
			return '';
		}

		return (
			<span className="plan-features-2023-grid__item-annual-plan">
				{ translate( 'Included with annual plans' ) }
			</span>
		);
	};

	return (
		<>
			{ features.map( ( currentFeature, featureIndex ) => {
				const divClasses = classNames( '', getPlanClass( planName ), {
					'is-last-feature': featureIndex + 1 === features.length,
				} );
				const spanClasses = classNames( 'plan-features-2023-grid__item-info', {
					'is-annual-plan-feature': currentFeature.availableOnlyForAnnualPlans,
					'is-available': currentFeature.availableForCurrentPlan,
				} );
				const itemTitleClasses = classNames( 'plan-features-2023-grid__item-title', {
					'is-bold': currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN,
				} );
				const key = `${ currentFeature.getSlug() }-${ featureIndex }`;

				return (
					<div key={ key } className={ divClasses }>
						<PlanFeaturesItem annualOnlyContent={ annualPlansFeatureNotice( currentFeature ) }>
							<span className={ spanClasses } key={ key }>
								<span className={ itemTitleClasses }>
									<Plans2023Tooltip text={ currentFeature.getDescription?.() }>
										{ currentFeature.getTitle( domainName ) }
									</Plans2023Tooltip>
								</span>
							</span>
						</PlanFeaturesItem>
					</div>
				);
			} ) }
		</>
	);
};

export default localize( PlanFeatures2023GridFeatures );
