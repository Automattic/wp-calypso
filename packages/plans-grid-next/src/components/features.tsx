import { getPlanClass, FEATURE_CUSTOM_DOMAIN, isFreePlan } from '@automattic/calypso-products';
import { LoadingPlaceholder } from '@automattic/components';
import styled from '@emotion/styled';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Dispatch, SetStateAction } from 'react';
import { usePlansGridContext } from '../grid-context';
import { PlanFeaturesItem } from './item';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import type { TransformedFeatureObject, DataResponse } from '../types';

const SubdomainSuggestion = styled.div`
	.is-domain-name {
		position: absolute;
		top: -15px;
		color: var( --studio-gray-50 );
		text-decoration: line-through;
		max-width: 80%;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
`;

const FreePlanCustomDomainFeature: React.FC< {
	paidDomainName: string;
	generatedWPComSubdomain?: DataResponse< { domain_name: string } >;
	isCustomDomainAllowedOnFreePlan?: boolean;
} > = ( { paidDomainName, generatedWPComSubdomain, isCustomDomainAllowedOnFreePlan } ) => {
	const translate = useTranslate();
	const isLoading = generatedWPComSubdomain?.isLoading;
	return (
		<SubdomainSuggestion>
			{ isLoading && <LoadingPlaceholder /> }
			{ ! isLoading &&
				( isCustomDomainAllowedOnFreePlan ? (
					<div>
						{ translate( '%s will be a redirect', {
							args: [ paidDomainName ],
							comment: '%s is a domain name.',
						} ) }
					</div>
				) : (
					<>
						<div className="is-domain-name">{ paidDomainName }</div>
						<div>{ generatedWPComSubdomain?.result?.domain_name }</div>
					</>
				) ) }
		</SubdomainSuggestion>
	);
};

const PlanFeatures2023GridFeatures: React.FC< {
	features: Array< TransformedFeatureObject >;
	planSlug: string;
	paidDomainName?: string;
	generatedWPComSubdomain?: DataResponse< { domain_name: string } >;
	hideUnavailableFeatures?: boolean;
	selectedFeature?: string;
	isCustomDomainAllowedOnFreePlan?: boolean;
	activeTooltipId: string;
	setActiveTooltipId: Dispatch< SetStateAction< string > >;
} > = ( {
	features,
	planSlug,
	paidDomainName,
	generatedWPComSubdomain,
	hideUnavailableFeatures,
	selectedFeature,
	isCustomDomainAllowedOnFreePlan,
	activeTooltipId,
	setActiveTooltipId,
} ) => {
	const translate = useTranslate();
	const { enableFeatureTooltips } = usePlansGridContext();

	return (
		<>
			{ features.map( ( currentFeature, featureIndex ) => {
				if ( hideUnavailableFeatures && ! currentFeature.availableForCurrentPlan ) {
					return null;
				}

				const key = `${ currentFeature.getSlug() }-${ planSlug }-${ featureIndex }`;

				const isFreePlanAndCustomDomainFeature =
					currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN && isFreePlan( planSlug );

				if ( isFreePlanAndCustomDomainFeature && ! paidDomainName ) {
					return null;
				}

				const isHighlightedFeature = selectedFeature
					? currentFeature.getSlug() === selectedFeature
					: currentFeature?.isHighlighted ||
					  ( currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN && paidDomainName ) ||
					  ! currentFeature.availableForCurrentPlan;

				const divClasses = clsx( '', getPlanClass( planSlug ), {
					'is-last-feature': featureIndex + 1 === features.length,
				} );
				const spanClasses = clsx( 'plan-features-2023-grid__item-info', {
					'is-annual-plan-feature': currentFeature.availableOnlyForAnnualPlans,
					'is-available':
						isFreePlanAndCustomDomainFeature || currentFeature.availableForCurrentPlan,
				} );
				const itemTitleClasses = clsx( 'plan-features-2023-grid__item-title', {
					'is-bold': isHighlightedFeature,
				} );

				return (
					<div key={ key } className={ divClasses }>
						<PlanFeaturesItem>
							<span className={ spanClasses } key={ key }>
								<span className={ itemTitleClasses }>
									{ isFreePlanAndCustomDomainFeature ? (
										<Plans2023Tooltip
											text={
												enableFeatureTooltips
													? translate( '%s is not included', {
															args: [ paidDomainName as string ],
															comment: '%s is a domain name.',
													  } )
													: undefined
											}
											activeTooltipId={ activeTooltipId }
											setActiveTooltipId={ setActiveTooltipId }
											id={ key }
										>
											<FreePlanCustomDomainFeature
												key={ key }
												paidDomainName={ paidDomainName as string }
												generatedWPComSubdomain={ generatedWPComSubdomain }
												isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
											/>
										</Plans2023Tooltip>
									) : (
										<Plans2023Tooltip
											text={ enableFeatureTooltips ? currentFeature.getDescription?.() : undefined }
											activeTooltipId={ activeTooltipId }
											setActiveTooltipId={ setActiveTooltipId }
											id={ key }
										>
											<>
												{ currentFeature.getTitle( {
													domainName: paidDomainName,
												} ) }
												{ currentFeature?.getSubFeatureObjects?.()?.length ? (
													<ul className="plan-features-2023-grid__item-sub-feature-list">
														{ currentFeature.getSubFeatureObjects().map( ( subFeature ) => (
															<li>{ subFeature?.getTitle() }</li>
														) ) }
													</ul>
												) : null }
											</>
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

export default PlanFeatures2023GridFeatures;
