import { getPlanClass, FEATURE_CUSTOM_DOMAIN, isFreePlan } from '@automattic/calypso-products';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { useGetWordPressSubdomain } from '../hooks/use-get-wordpress-subdomain';
import { PlanFeaturesItem } from './item';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import type { TransformedFeatureObject } from '../types';

const SubdomainSuggestion = styled.div`
	.is-domain-name {
		position: absolute;
		top: -15px;
		color: var( --studio-gray-50 );
		text-decoration: line-through;
	}
`;

const LoadingPlaceHolder = styled.div`
	margin: 0;
`;

const FreePlanCustomDomainFeature: React.FC< { domainName: string } > = ( { domainName } ) => {
	const {
		data: wordPressSubdomainSuggestion,
		isLoading,
		isError,
	} = useGetWordPressSubdomain( domainName );

	return (
		<SubdomainSuggestion>
			<div className="is-domain-name">{ domainName }</div>
			{ isLoading && <LoadingPlaceHolder className="async-load__placeholder" /> }
			{ ! isError && <div>{ wordPressSubdomainSuggestion?.domain_name }</div> }
		</SubdomainSuggestion>
	);
};

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
				const key = `${ currentFeature.getSlug() }-${ featureIndex }`;

				const isFreePlanAndCustomDomainFeature =
					currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN && isFreePlan( planName );

				const divClasses = classNames( '', getPlanClass( planName ), {
					'is-last-feature': featureIndex + 1 === features.length,
				} );
				const spanClasses = classNames( 'plan-features-2023-grid__item-info', {
					'is-annual-plan-feature': currentFeature.availableOnlyForAnnualPlans,
					'is-available':
						isFreePlanAndCustomDomainFeature || currentFeature.availableForCurrentPlan,
				} );
				const itemTitleClasses = classNames( 'plan-features-2023-grid__item-title', {
					'is-bold':
						currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN
							? true
							: ! currentFeature.availableForCurrentPlan,
				} );

				return (
					<div key={ key } className={ divClasses }>
						<PlanFeaturesItem>
							<span className={ spanClasses } key={ key }>
								<span className={ itemTitleClasses }>
									{ isFreePlanAndCustomDomainFeature ? (
										<FreePlanCustomDomainFeature key={ key } domainName={ domainName } />
									) : (
										<Plans2023Tooltip text={ currentFeature.getDescription?.() }>
											{ currentFeature.getTitle( domainName ) }
										</Plans2023Tooltip>
									) }
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
