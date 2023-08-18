import {
	PlanSlug,
	getPlanClass,
	isWooExpressPlusPlan,
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
import { GridPlan } from '../hooks/npm-ready/data-store/use-grid-plans';
import { PlanRowOptions } from '../types';
import { Container } from './container';

interface Props {
	planSlug: PlanSlug;
	options?: PlanRowOptions;
	gridPlansForFeaturesGrid: GridPlan[];
}

export default function PreviousPlanFeaturesIncludedSection( {
	planSlug,
	gridPlansForFeaturesGrid,
	options,
}: Props ) {
	const translate = useTranslate();
	const shouldRenderEnterpriseLogos =
		isWpcomEnterpriseGridPlan( planSlug ) || isWooExpressPlusPlan( planSlug );
	const shouldShowFeatureTitle = ! isWpComFreePlan( planSlug ) && ! shouldRenderEnterpriseLogos;
	const indexInGridPlansForFeaturesGrid = gridPlansForFeaturesGrid.findIndex(
		( { planSlug: slug } ) => slug === planSlug
	);
	const previousProductName =
		indexInGridPlansForFeaturesGrid > 0
			? gridPlansForFeaturesGrid[ indexInGridPlansForFeaturesGrid - 1 ].productNameShort
			: null;
	const title =
		previousProductName &&
		translate( 'Everything in %(planShortName)s, plus:', {
			args: { planShortName: previousProductName },
		} );
	const classes = classNames( 'plan-features-2023-grid__common-title', getPlanClass( planSlug ) );
	const rowspanProp = options?.isTableCell && shouldRenderEnterpriseLogos ? { rowSpan: '2' } : {};
	return (
		<Container
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
		</Container>
	);
}
