import { PlanSlug } from '@automattic/calypso-products';
import { AddOns, WpcomPlansUI } from '@automattic/data-stores';
import { formatCurrency } from '@automattic/number-formatters';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useId } from 'react';
import { usePlansGridContext } from '../../../../grid-context';
import useIsLargeCurrency from '../../../../hooks/use-is-large-currency';
import usePlanStorage from '../hooks/use-plan-storage';
import usePurchasedStorageAddOn from '../hooks/use-purchased-storage-add-on';
import useStorageString from '../hooks/use-storage-string';

interface Props {
	planSlug: PlanSlug;
	onAddMoreClick?: () => void;
	showAddMore?: boolean;
}

const StorageFeatureLabel = ( { planSlug, onAddMoreClick, showAddMore }: Props ) => {
	const translate = useTranslate();
	const {
		gridPlansIndex,
		enableStorageAsBadge = true,
		showFeatureCheckmarks,
		siteId,
	} = usePlansGridContext();
	const {
		pricing: { currencyCode },
	} = gridPlansIndex[ planSlug ];
	const planStorage = usePlanStorage( planSlug );
	const purchasedStorageAddOn = usePurchasedStorageAddOn();
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const selectedStorageOptionForPlan = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptionForPlan( planSlug, siteId ),
		[ planSlug, siteId ]
	);
	const selectedStorageAddOn = showFeatureCheckmarks
		? storageAddOns.find( ( addOn ) => addOn?.addOnSlug === selectedStorageOptionForPlan )
		: null;
	const storageAddOn = selectedStorageAddOn ?? purchasedStorageAddOn;

	const monthlyAddedCost = storageAddOn?.prices?.monthlyPrice ?? 0;
	const formattedMonthlyAddedCost =
		monthlyAddedCost &&
		currencyCode &&
		formatCurrency( monthlyAddedCost, currencyCode, { isSmallestUnit: true } );
	const isLargeCurrency = useIsLargeCurrency( {
		prices: [ monthlyAddedCost ],
		isAddOn: true,
		currencyCode: currencyCode ?? 'USD',
	} );
	const totalStorageString = useStorageString( planStorage + ( storageAddOn?.quantity ?? 0 ) );
	const storageCloudMaskId = `plans-grid-next-storage-cloud-mask-${ useId().replace( /:/g, '' ) }`;
	const storageLabel = translate( '%s storage', {
		args: [ totalStorageString ],
		comment: '%s is the amount of storage, including the unit. For example "10 GB"',
	} );

	const containerClasses = clsx( 'plans-grid-next-storage-feature-label__container', {
		'is-row': ! isLargeCurrency && ! showAddMore,
		'is-add-more': showAddMore,
	} );

	const volumeJSX =
		enableStorageAsBadge && ! showAddMore ? (
			<div className="plans-grid-next-storage-feature-label__volume is-badge">
				{ totalStorageString }
			</div>
		) : (
			<div className="plans-grid-next-storage-feature-label__volume">
				{ showFeatureCheckmarks && (
					<svg
						className="plans-grid-next-storage-feature-label__icon"
						width="17"
						height="12"
						viewBox="0 0 17 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						focusable="false"
					>
						<mask id={ storageCloudMaskId } fill="white">
							<path d="M8.30664 0C10.5453 0 12.4108 1.59411 12.832 3.70898C14.953 3.896 16.6162 5.67714 16.6162 7.84668C16.616 9.98525 14.9996 11.745 12.9219 11.9736V12H3.69141V11.9736C1.61495 11.7436 0 9.98349 0 7.8457C0.000230272 5.67769 1.66132 3.89782 3.78027 3.70898C4.20142 1.59404 6.06793 7.12951e-05 8.30664 0Z" />
						</mask>
						<path
							d="M8.30664 0V-1.5H8.30659L8.30664 0ZM12.832 3.70898L11.3609 4.00201L11.5805 5.10445L12.7003 5.20319L12.832 3.70898ZM16.6162 7.84668L18.1162 7.84684V7.84668H16.6162ZM12.9219 11.9736L12.7578 10.4826L11.4219 10.6297V11.9736H12.9219ZM12.9219 12V13.5H14.4219V12H12.9219ZM3.69141 12H2.19141V13.5H3.69141V12ZM3.69141 11.9736H5.19141V10.6306L3.85655 10.4828L3.69141 11.9736ZM0 7.8457L-1.5 7.84554V7.8457H0ZM3.78027 3.70898L3.91342 5.20306L5.03206 5.10337L5.25139 4.00193L3.78027 3.70898ZM8.30664 0V1.5C9.81555 1.5 11.0766 2.57467 11.3609 4.00201L12.832 3.70898L14.3031 3.41596C13.7449 0.613552 11.2751 -1.5 8.30664 -1.5V0ZM12.832 3.70898L12.7003 5.20319C14.0537 5.32253 15.1162 6.46133 15.1162 7.84668H16.6162H18.1162C18.1162 4.89294 15.8523 2.46948 12.9638 2.21478L12.832 3.70898ZM16.6162 7.84668L15.1162 7.84652C15.1161 9.2112 14.0842 10.3366 12.7578 10.4826L12.9219 11.9736L13.086 13.4646C15.9149 13.1533 18.1159 10.7593 18.1162 7.84684L16.6162 7.84668ZM12.9219 11.9736H11.4219V12H12.9219H14.4219V11.9736H12.9219ZM12.9219 12V10.5H3.69141V12V13.5H12.9219V12ZM3.69141 12H5.19141V11.9736H3.69141H2.19141V12H3.69141ZM3.69141 11.9736L3.85655 10.4828C2.5313 10.336 1.5 9.21028 1.5 7.8457H0H-1.5C-1.5 10.7567 0.698607 13.1513 3.52626 13.4645L3.69141 11.9736ZM0 7.8457L1.5 7.84586C1.50015 6.46158 2.56121 5.32357 3.91342 5.20306L3.78027 3.70898L3.64712 2.21491C0.76142 2.47207 -1.49969 4.8938 -1.5 7.84554L0 7.8457ZM3.78027 3.70898L5.25139 4.00193C5.53552 2.57508 6.79723 1.50005 8.30669 1.5L8.30664 0L8.30659 -1.5C5.33863 -1.49991 2.86733 0.612993 2.30916 3.41604L3.78027 3.70898Z"
							fill="currentColor"
							mask={ `url(#${ storageCloudMaskId })` }
						/>
					</svg>
				) }
				<span className="plans-grid-next-storage-feature-label__text">{ storageLabel }</span>
				{ showAddMore && (
					<button
						className="plans-grid-next-storage-feature-label__add-more"
						type="button"
						onClick={ onAddMoreClick }
					>
						{ translate( 'Add more' ) }
					</button>
				) }
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
