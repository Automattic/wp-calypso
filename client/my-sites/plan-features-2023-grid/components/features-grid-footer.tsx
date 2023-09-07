import styled from '@emotion/styled';
import { useMemo } from '@wordpress/element';
import { usePlansGridContext } from '../grid-context';
import usePlanFeatureFootnotes from '../hooks/npm-ready/data-store/use-plan-feature-footnotes';

const FeatureFootnotes = styled.div`
	ol {
		margin: 2em 0 0 1em;
	}

	ol li {
		font-size: 11px;
		padding-left: 1em;
	}
`;

const FeaturesGridFooter = () => {
	const { siteId, intent, gridPlans } = usePlansGridContext();
	const planFeatureFootnotes = usePlanFeatureFootnotes( { siteId, plansIntent: intent } );

	// match footnotes to the plans that are visible in the grid
	const visibleFootnotes = useMemo( () => {
		// these checks can get complicated, so let's not add more for now. consider a redesign/refactor first
		return planFeatureFootnotes?.footnoteList?.filter( () =>
			gridPlans.some( ( plan ) =>
				plan.features.wpcomFeatures.some( ( feature ) =>
					plan.isMonthlyPlan && feature.availableOnlyForAnnualPlans
						? false
						: Object.keys( planFeatureFootnotes?.footnotesByFeature ?? {} ).some(
								( featureSlug ) => featureSlug === feature.getSlug()
						  )
				)
			)
		);
	}, [ planFeatureFootnotes, gridPlans ] );

	return (
		<div className="plan-comparison-grid__footer">
			{ visibleFootnotes && (
				<FeatureFootnotes>
					<ol>
						{ visibleFootnotes.map( ( footnote, index ) => {
							return <li key={ `${ footnote }-${ index }` }>{ footnote }</li>;
						} ) }
					</ol>
				</FeatureFootnotes>
			) }
		</div>
	);
};

export default FeaturesGridFooter;
