import { PlanSlug } from '@automattic/calypso-products';
import clsx from 'clsx';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../../grid-context';
import useIsLargeCurrency from '../../../../hooks/use-is-large-currency';
import usePlanStorage from '../hooks/use-plan-storage';
import usePurchasedStorageAddOn from '../hooks/use-purchased-storage-add-on';
import useStorageString from '../hooks/use-storage-string';

interface Props {
	planSlug: PlanSlug;
}

const StorageFeatureLabel = ( { planSlug }: Props ) => {
	const translate = useTranslate();
	const { gridPlansIndex, enableStorageAsBadge = true } = usePlansGridContext();
	const {
		pricing: { currencyCode },
	} = gridPlansIndex[ planSlug ];
	const planStorage = usePlanStorage( planSlug );
	const purchasedStorageAddOn = usePurchasedStorageAddOn();

	const monthlyAddedCost = purchasedStorageAddOn?.prices?.monthlyPrice ?? 0;
	const formattedMonthlyAddedCost =
		monthlyAddedCost &&
		currencyCode &&
		formatCurrency( monthlyAddedCost, currencyCode, { isSmallestUnit: true } );
	const isLargeCurrency = useIsLargeCurrency( {
		prices: [ monthlyAddedCost ],
		isAddOn: true,
		currencyCode: currencyCode ?? 'USD',
	} );
	const totalStorageString = useStorageString(
		planStorage + ( purchasedStorageAddOn?.quantity ?? 0 )
	);

	const containerClasses = clsx( 'plans-grid-next-storage-feature-label__container', {
		'is-row': ! isLargeCurrency,
	} );

	const volumeJSX = enableStorageAsBadge ? (
		<div className="plans-grid-next-storage-feature-label__volume is-badge">
			{ totalStorageString }
		</div>
	) : (
		<div className="plans-grid-next-storage-feature-label__volume">
			{ translate( '%s storage', {
				args: [ totalStorageString ],
				comment: '%s is the amount of storage, including the unit. For example "10 GB"',
			} ) }
		</div>
	);

	return formattedMonthlyAddedCost ? (
		<div className={ containerClasses }>
			{ volumeJSX }
			<div className="plans-grid-next-storage-feature-label__offset-price">
				{ translate( '+ %(formattedMonthlyAddedCost)s/month', {
					args: { formattedMonthlyAddedCost },
				} ) }
			</div>
		</div>
	) : (
		volumeJSX
	);
};

export default StorageFeatureLabel;
