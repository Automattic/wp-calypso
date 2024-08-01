import {
	getPlanClass,
	isWpcomEnterpriseGridPlan,
	PLAN_ENTERPRISE_FEATURE_LIST,
	PLAN_ENTERPRISE_FEATURE_LIST_TITLE,
} from '@automattic/calypso-products';
import { ClientLogoList, FoldableCard } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../grid-context';
import { GridPlan } from '../../types';
import { PlanFeaturesItem } from '../item';
import PlanDivOrTdContainer from '../plan-div-td-container';

type PreviousFeaturesIncludedTitleProps = {
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const EnterpriseFeatures = ( {
	renderedGridPlans,
	options,
}: PreviousFeaturesIncludedTitleProps ) => {
	const translate = useTranslate();
	const { featureGroupMap, enableCategorisedFeatures } = usePlansGridContext();
	const isTableCell = options?.isTableCell;

	const CardContainer = ( props: React.ComponentProps< typeof FoldableCard > ) => {
		const { children, className, ...otherProps } = props;

		return isTableCell ? (
			<div className={ className } { ...otherProps }>
				{ children }
			</div>
		) : (
			<FoldableCard
				className={ clsx(
					'plans-grid-next-features-grid__mobile-plan-card-foldable-container',
					className
				) }
				header={ translate( 'Show all features' ) }
				{ ...otherProps }
				compact
				clickableHeader
			>
				{ children }
			</FoldableCard>
		);
	};

	return renderedGridPlans.map( ( { planSlug, features: { wpcomFeatures, jetpackFeatures } } ) => {
		const planClassName = getPlanClass( planSlug );
		const shouldRenderLogos = isWpcomEnterpriseGridPlan( planSlug );
		const shouldCoverFullColumn =
			( wpcomFeatures.length === 0 && jetpackFeatures.length === 0 ) || enableCategorisedFeatures;
		const rowspanProp =
			isTableCell && shouldRenderLogos
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
					<>
						<div className="plan-features-2023-grid__item">
							<ClientLogoList className="plan-features-2023-grid__item-logos" />
						</div>

						<CardContainer>
							<div className={ clsx( 'plan-features-2023-grid__common-title', planClassName ) }>
								{ PLAN_ENTERPRISE_FEATURE_LIST_TITLE }
							</div>
							{ PLAN_ENTERPRISE_FEATURE_LIST.map( ( title, index ) => (
								<PlanFeaturesItem key={ index }>
									<span className="plan-features-2023-grid__item-info is-available">
										<span className="plan-features-2023-grid__item-title">{ title }</span>
									</span>
								</PlanFeaturesItem>
							) ) }
						</CardContainer>
					</>
				) }
			</PlanDivOrTdContainer>
		);
	} );
};

export default EnterpriseFeatures;
