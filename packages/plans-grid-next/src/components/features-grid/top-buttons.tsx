import {
	PlanSlug,
	getPlan,
	isBusinessTrial,
	isWooExpressMediumPlan,
	isWooExpressSmallPlan,
} from '@automattic/calypso-products';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { GridPlan, PlanActionOverrides } from '../../types';
import PlanFeatures2023GridActions from '../actions';
import PlanDivOrTdContainer from '../plan-div-td-container';

type TopButtonsProps = {
	currentSitePlanSlug?: string | null;
	isInSignup: boolean;
	isLaunchPage?: boolean | null;
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
	planActionOverrides?: PlanActionOverrides;
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
		isStuck?: boolean;
	};
};

const TopButtons = ( props: TopButtonsProps ) => {
	const {
		currentSitePlanSlug,
		isInSignup,
		isLaunchPage,
		onUpgradeClick,
		options,
		planActionOverrides,
		renderedGridPlans,
	} = props;
	const translate = useTranslate();

	return renderedGridPlans.map(
		( { planSlug, availableForPurchase, isMonthlyPlan, features: { storageOptions } } ) => {
			const classes = classNames( 'plan-features-2023-grid__table-item', 'is-top-buttons' );

			// Leaving it `undefined` makes it use the default label
			let buttonText;

			if (
				isWooExpressMediumPlan( planSlug ) &&
				! isWooExpressMediumPlan( currentSitePlanSlug || '' )
			) {
				buttonText = translate( 'Get Performance', { textOnly: true } );
			} else if (
				isWooExpressSmallPlan( planSlug ) &&
				! isWooExpressSmallPlan( currentSitePlanSlug || '' )
			) {
				buttonText = translate( 'Get Essential', { textOnly: true } );
			} else if ( isBusinessTrial( currentSitePlanSlug || '' ) ) {
				buttonText = translate( 'Get %(plan)s', {
					textOnly: true,
					args: {
						plan: getPlan( planSlug )?.getTitle() || '',
					},
				} );
			}

			return (
				<PlanDivOrTdContainer
					key={ planSlug }
					className={ classes }
					isTableCell={ options?.isTableCell }
				>
					<PlanFeatures2023GridActions
						availableForPurchase={ availableForPurchase }
						isInSignup={ isInSignup }
						isLaunchPage={ isLaunchPage }
						isMonthlyPlan={ isMonthlyPlan }
						onUpgradeClick={ ( overridePlanSlug ) =>
							onUpgradeClick( overridePlanSlug ?? planSlug )
						}
						planSlug={ planSlug }
						currentSitePlanSlug={ currentSitePlanSlug }
						buttonText={ buttonText }
						planActionOverrides={ planActionOverrides }
						showMonthlyPrice={ true }
						isStuck={ options?.isStuck || false }
						storageOptions={ storageOptions }
						visibleGridPlans={ renderedGridPlans }
					/>
				</PlanDivOrTdContainer>
			);
		}
	);
};

export default TopButtons;
