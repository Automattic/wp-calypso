import { getPlanClass, FEATURE_CUSTOM_DOMAIN, isFreePlan } from '@automattic/calypso-products';
import { DomainSuggestions } from '@automattic/data-stores';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { LoadingPlaceHolder } from '../../plans-features-main/components/loading-placeholder';
import { PlanFeaturesItem } from './item';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import type { TransformedFeatureObject } from '../types';

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

const FreePlanCustomDomainFeature: React.FC< { paidDomainName: string } > = ( {
	paidDomainName,
} ) => {
	const {
		data: wordPressSubdomainSuggestions,
		isInitialLoading,
		isError,
	} = DomainSuggestions.useGetWordPressSubdomain( paidDomainName );

	return (
		<SubdomainSuggestion>
			<div className="is-domain-name">{ paidDomainName }</div>
			{ isInitialLoading && <LoadingPlaceHolder /> }
			{ ! isError && <div>{ wordPressSubdomainSuggestions?.[ 0 ]?.domain_name }</div> }
		</SubdomainSuggestion>
	);
};

const PlanFeatures2023GridFeatures: React.FC< {
	features: Array< TransformedFeatureObject >;
	planName: string;
	paidDomainName?: string;
	hideUnavailableFeatures?: boolean;
	selectedFeature?: string;
} > = ( { features, planName, paidDomainName, hideUnavailableFeatures, selectedFeature } ) => {
	const translate = useTranslate();
	return (
		<>
			{ features.map( ( currentFeature, featureIndex ) => {
				if ( hideUnavailableFeatures && ! currentFeature.availableForCurrentPlan ) {
					return null;
				}

				const key = `${ currentFeature.getSlug() }-${ featureIndex }`;

				const isFreePlanAndCustomDomainFeature =
					currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN && isFreePlan( planName );

				if ( isFreePlanAndCustomDomainFeature && ! paidDomainName ) {
					return null;
				}

				const isHighlightedFeature = selectedFeature
					? currentFeature.getSlug() === selectedFeature
					: currentFeature.getSlug() === FEATURE_CUSTOM_DOMAIN ||
					  ! currentFeature.availableForCurrentPlan;

				const divClasses = classNames( '', getPlanClass( planName ), {
					'is-last-feature': featureIndex + 1 === features.length,
				} );
				const spanClasses = classNames( 'plan-features-2023-grid__item-info', {
					'is-annual-plan-feature': currentFeature.availableOnlyForAnnualPlans,
					'is-available':
						isFreePlanAndCustomDomainFeature || currentFeature.availableForCurrentPlan,
				} );
				const itemTitleClasses = classNames( 'plan-features-2023-grid__item-title', {
					'is-bold': isHighlightedFeature,
				} );

				return (
					<div key={ key } className={ divClasses }>
						<PlanFeaturesItem>
							<span className={ spanClasses } key={ key }>
								<span className={ itemTitleClasses }>
									{ isFreePlanAndCustomDomainFeature ? (
										<Plans2023Tooltip
											text={ translate( '%s is not included', {
												args: [ paidDomainName as string ],
												comment: '%s is a domain name.',
											} ) }
										>
											<FreePlanCustomDomainFeature
												key={ key }
												paidDomainName={ paidDomainName as string }
											/>
										</Plans2023Tooltip>
									) : (
										<Plans2023Tooltip text={ currentFeature.getDescription?.() }>
											{ currentFeature.getTitle( paidDomainName ) }
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
