import { PlanSlug, WPComPlanStorageFeatureSlug } from '@automattic/calypso-products';
import { AddOns } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/format-currency';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../../../grid-context';
import useIsLargeCurrency from '../../../../hooks/use-is-large-currency';
import useStorageStringFromFeature from '../hooks/use-storage-string-from-feature';

interface Props {
	planSlug: PlanSlug;
}

const StorageFeatureLabel = ( { planSlug }: Props ) => {
	const translate = useTranslate();
	const { siteId, gridPlansIndex } = usePlansGridContext();
	const {
		pricing: { currencyCode },
		features: { storageFeature },
	} = gridPlansIndex[ planSlug ];
	const storageSlug = storageFeature?.getSlug() as WPComPlanStorageFeatureSlug | undefined;
	const storageStringFromFeature = useStorageStringFromFeature( {
		siteId,
		storageSlug,
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

	const containerClasses = clsx( 'plans-grid-next-storage-feature-label__container', {
		'is-row': ! isLargeCurrency,
	} );

	const volumeJSX = (
		<div className="plans-grid-next-storage-feature-label__volume-badge" key={ storageSlug }>
			{ storageStringFromFeature }
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
