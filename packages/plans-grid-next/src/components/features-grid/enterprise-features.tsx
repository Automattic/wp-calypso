import { getPlanClass, isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { ClientLogoList, FoldableCard } from '@automattic/components';
import clsx from 'clsx';
import i18n from 'i18n-calypso';
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

const PLAN_ENTERPRISE_FEATURE_LIST_TITLE: string = i18n.translate(
	'High performance platform, with:'
);

const PLAN_ENTERPRISE_FEATURE_LIST: string[] = [
	i18n.translate( 'Multifaceted security' ),
	i18n.translate( 'Generative AI' ),
	i18n.translate( 'Integrated content analytics' ),
	i18n.translate( '24/7 support' ),
	i18n.translate( 'Professional services' ),
	i18n.translate( 'API mesh and node hosting' ),
	i18n.translate( 'Containerized environment' ),
	i18n.translate( 'Global infrastructure' ),
	i18n.translate( 'Dynamic autoscaling' ),
	i18n.translate( 'Integrated CDN' ),
	i18n.translate( 'Integrated code repository' ),
	i18n.translate( 'Staging environments' ),
	i18n.translate( 'Management dashboard' ),
	i18n.translate( 'Command line interface (CLI)' ),
	i18n.translate( 'Efficient multi-site management' ),
	i18n.translate( 'Advanced access controls' ),
	i18n.translate( 'Single sign-on (SSO)' ),
	i18n.translate( 'DDoS protection and mitigation' ),
	i18n.translate( 'Plugin and theme vulnerability scanning' ),
	i18n.translate( 'Automated plugin upgrade' ),
	i18n.translate( 'Integrated enterprise search' ),
	i18n.translate( 'Integrated APM' ),
];

const EnterpriseFeatures = ( {
	renderedGridPlans,
	options,
}: PreviousFeaturesIncludedTitleProps ) => {
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
				header={ i18n.translate( 'Show all features' ) }
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
