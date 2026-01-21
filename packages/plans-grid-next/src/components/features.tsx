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

// var1d experiment: Badge displayed after feature title
const FeatureBadge = styled.span`
	display: inline-flex;
	height: 18px;
	padding: 0 6px;
	justify-content: center;
	align-items: center;
	gap: 8px;
	border-radius: 4px;
	background: #d7ffba;
	color: #008a20;
	text-align: center;
	font-size: 11px;
	font-weight: 600;
	line-height: 16px;
	margin-inline-start: 8px;
	vertical-align: baseline;
	text-decoration: none;
	white-space: nowrap;
`;

// var1d experiment: Checkmark bullet icon for differentiator features
const DifferentiatorCheckIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="16"
		height="20"
		viewBox="0 0 16 20"
		fill="none"
		style={ { flexShrink: 0, marginInlineEnd: '8px', verticalAlign: 'top' } }
	>
		<circle opacity="0.13" cx="8" cy="10" r="8" fill="#9CA0B2" />
		<path d="M5 9.77778L7.14286 12L11 8" stroke="#5B5E6C" strokeWidth="1.2" />
	</svg>
);

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

				const featureSlug = currentFeature.getSlug();
				const featuresWithMinHeight = [
					'support-from-experts',
					'priority-24-7-support',
					'upload-video',
				];

				const divClasses = clsx( '', getPlanClass( planSlug ), {
					'is-last-feature': featureIndex + 1 === features.length,
					'has-min-height': featuresWithMinHeight.includes( featureSlug ),
					'is-differentiator-feature': currentFeature.isDifferentiatorFeature,
					'is-header-feature': currentFeature.isHeaderFeature,
					'is-var1d-last-feature': currentFeature.isVar1dLastFeature,
					'is-experiment-last-feature': currentFeature.isExperimentLastFeature,
				} );
				const spanClasses = clsx( 'plan-features-2023-grid__item-info', {
					'is-annual-plan-feature': currentFeature.availableOnlyForAnnualPlans,
					'is-available':
						isFreePlanAndCustomDomainFeature || currentFeature.availableForCurrentPlan,
				} );
				const itemTitleClasses = clsx( 'plan-features-2023-grid__item-title', {
					'is-bold': isHighlightedFeature,
					'is-differentiator-feature': currentFeature.isDifferentiatorFeature,
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
												{ currentFeature.isDifferentiatorFeature && <DifferentiatorCheckIcon /> }
												<span className="plan-features-2023-grid__item-text-content">
													{ currentFeature.getTitle( {
														domainName: paidDomainName,
													} ) }
													{ currentFeature.badgeText && (
														<FeatureBadge>{ currentFeature.badgeText }</FeatureBadge>
													) }
												</span>
												{ currentFeature?.getSubFeatureObjects?.()?.length ? (
													<ul className="plan-features-2023-grid__item-sub-feature-list">
														{ currentFeature.getSubFeatureObjects().map( ( subFeature ) => (
															<li key={ subFeature.getSlug() }>{ subFeature?.getTitle() }</li>
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
