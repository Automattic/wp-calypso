import { getPlanClass, FEATURE_CUSTOM_DOMAIN } from '@automattic/calypso-products';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { PlanFeaturesItem } from './item';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import type { TransformedFeatureObject } from '../types';

const PlanFeatures2023GridFeatures: React.FC< {
	features: Array< TransformedFeatureObject >;
	planName: string;
	domainName: string;
	hideUnavailableFeatures: boolean;
} > = ( { features, planName, domainName, hideUnavailableFeatures } ) => {
	return (
		<>
			{ features.map( ( currentFeature, featureIndex ) => {
				if ( hideUnavailableFeatures && ! currentFeature.availableForCurrentPlan ) {
					return null;
				}

				const divClasses = classNames( '', getPlanClass( planName ), {
					'is-last-feature': featureIndex + 1 === features.length,
				} );
				const spanClasses = classNames( 'plan-features-2023-grid__item-info', {
					'is-annual-plan-feature': currentFeature.availableOnlyForAnnualPlans,
					'is-available': currentFeature.availableForCurrentPlan,
				} );
				const itemTitleClasses = classNames( 'plan-features-2023-grid__item-title', {
					'is-bold':
						currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN
							? true
							: ! currentFeature.availableForCurrentPlan,
				} );
				const key = `${ currentFeature.getSlug() }-${ featureIndex }`;

				return (
					<div key={ key } className={ divClasses }>
						<PlanFeaturesItem>
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
