import {
	getPlanClass,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import {
	BloombergLogo,
	CNNLogo,
	CondenastLogo,
	DisneyLogo,
	FacebookLogo,
	SalesforceLogo,
	SlackLogo,
	TimeLogo,
} from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { GridPlan } from '../../types';
import PlanDivOrTdContainer from '../plan-div-td-container';

type PreviousFeaturesIncludedTitleProps = {
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PreviousFeaturesIncludedTitle = ( props: PreviousFeaturesIncludedTitleProps ) => {
	const { renderedGridPlans, options } = props;
	const translate = useTranslate();

	return renderedGridPlans.map( ( { planSlug } ) => {
		const shouldRenderEnterpriseLogos = isWpcomEnterpriseGridPlan( planSlug );
		const shouldShowFeatureTitle = ! isWpComFreePlan( planSlug ) && ! shouldRenderEnterpriseLogos;
		const indexInGridPlansForFeaturesGrid = renderedGridPlans.findIndex(
			( { planSlug: slug } ) => slug === planSlug
		);
		const previousProductName =
			indexInGridPlansForFeaturesGrid > 0
				? renderedGridPlans[ indexInGridPlansForFeaturesGrid - 1 ].productNameShort
				: null;
		const title =
			previousProductName &&
			translate( 'Everything in %(planShortName)s, plus:', {
				args: { planShortName: previousProductName },
			} );
		const classes = classNames( 'plan-features-2023-grid__common-title', getPlanClass( planSlug ) );
		const rowspanProp = options?.isTableCell && shouldRenderEnterpriseLogos ? { rowSpan: '2' } : {};
		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				isTableCell={ options?.isTableCell }
				className="plan-features-2023-grid__table-item"
				{ ...rowspanProp }
			>
				{ shouldShowFeatureTitle && <div className={ classes }>{ title }</div> }
				{ shouldRenderEnterpriseLogos && (
					<div className="plan-features-2023-grid__item plan-features-2023-grid__enterprise-logo">
						<TimeLogo />
						<SlackLogo />
						<DisneyLogo />
						<CNNLogo />
						<SalesforceLogo />
						<FacebookLogo />
						<CondenastLogo />
						<BloombergLogo />
					</div>
				) }
			</PlanDivOrTdContainer>
		);
	} );
};

export default PreviousFeaturesIncludedTitle;
