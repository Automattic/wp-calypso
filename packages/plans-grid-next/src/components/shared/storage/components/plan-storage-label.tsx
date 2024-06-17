import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PlanSlug,
	StorageOption,
} from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../../grid-context';
import useIsLargeCurrency from '../../../../hooks/use-is-large-currency';
import useStorageStringFromFeature from '../hooks/use-storage-string-from-feature';

interface Props {
	storageOption: StorageOption;
	planSlug: PlanSlug;
}

const ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE = [ PLAN_BUSINESS, PLAN_ECOMMERCE ];

const PlanStorageLabel = ( { storageOption, planSlug }: Props ) => {
	const translate = useTranslate();
	const { siteId, gridPlansIndex } = usePlansGridContext();
	const currencyCode = gridPlansIndex[ planSlug ].pricing.currencyCode;
	const storageStringFromFeature = useStorageStringFromFeature( {
		siteId,
		storageFeature: storageOption.slug,
		planSlug,
	} );
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const storageAddOnsPurchased = storageAddOns.filter( ( addOn ) => addOn?.purchased );
	const monthlyAddedCost = storageAddOnsPurchased
		? Object.values( storageAddOnsPurchased ).reduce( ( total, addOn ) => {
				return total + ( addOn?.prices?.monthlyPrice ?? 0 );
		  }, 0 )
		: 0;
	const formattedMonthlyAddedCost =
		monthlyAddedCost &&
		currencyCode &&
		formatCurrency( monthlyAddedCost, currencyCode, { isSmallestUnit: true } );
	const isLargeCurrency = useIsLargeCurrency( {
		prices: [ monthlyAddedCost ],
		isAddOn: true,
		currencyCode: currencyCode ?? 'USD',
	} );

	const containerClasses = clsx( 'plans-grid-next-plan-storage-label__container', {
		'is-row': ! isLargeCurrency,
	} );

	const volumeJSX = (
		<div className="plan-features-2023-grid__storage-buttons" key={ storageOption.slug }>
			{ storageStringFromFeature }
		</div>
	);

	return formattedMonthlyAddedCost && ELIGIBLE_PLANS_FOR_STORAGE_UPGRADE.includes( planSlug ) ? (
		<div className={ containerClasses }>
			{ volumeJSX }
			<div className="plans-grid-next-plan-storage-label__offset-price">
				{ translate( '+ %(formattedMonthlyAddedCost)s/month', {
					args: { formattedMonthlyAddedCost },
				} ) }
			</div>
		</div>
	) : (
		volumeJSX
	);
};

export default PlanStorageLabel;
