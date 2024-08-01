import { isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { ClientLogoList } from '@automattic/components';
import { usePlansGridContext } from '../../grid-context';
import { GridPlan } from '../../types';
import PlanDivOrTdContainer from '../plan-div-td-container';

type PreviousFeaturesIncludedTitleProps = {
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PartnerLogos = ( { renderedGridPlans, options }: PreviousFeaturesIncludedTitleProps ) => {
	const { featureGroupMap, enableCategorisedFeatures } = usePlansGridContext();

	return renderedGridPlans.map( ( { planSlug, features: { wpcomFeatures, jetpackFeatures } } ) => {
		const shouldRenderLogos = isWpcomEnterpriseGridPlan( planSlug );
		const shouldCoverFullColumn =
			( wpcomFeatures.length === 0 && jetpackFeatures.length === 0 ) || enableCategorisedFeatures;
		const rowspanProp =
			options?.isTableCell && shouldRenderLogos
				? {
						...( shouldCoverFullColumn && {
							/**
							 * The rowSpan should be:
							 * - the number of feature groups + 2 (1 this row + 1 row of storage) in case of feature categories,
							 * - otherwise: 4 (1 this row + 1 row of features + 1 row of storage + 1 row for the "everything in ... plus" part)
							 */
							rowSpan: enableCategorisedFeatures ? Object.values( featureGroupMap ).length + 2 : 4,
						} ),
				  }
				: {};

		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				isTableCell={ options?.isTableCell }
				className="plan-features-2023-grid__table-item"
				{ ...rowspanProp }
			>
				{ isWpcomEnterpriseGridPlan( planSlug ) && (
					<div className="plan-features-2023-grid__item">
						<ClientLogoList className="plan-features-2023-grid__item-logos" />
					</div>
				) }
			</PlanDivOrTdContainer>
		);
	} );
};

export default PartnerLogos;
