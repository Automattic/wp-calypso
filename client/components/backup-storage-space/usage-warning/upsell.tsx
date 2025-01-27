import { PlanPrice } from '@automattic/components';
import clsx from 'clsx';
import { useCallback, useEffect } from 'react';
import TimeFrame from 'calypso/components/jetpack/card/jetpack-product-card/display-price/time-frame';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { StorageUsageLevelName } from 'calypso/state/rewind/storage/types';
import ActionButton from './action-button';
import useUpsellInfo from './use-upsell-slug';
import './style.scss';

type UpsellProps = {
	siteSlug: string;
	bytesUsed: number;
	usageLevel: StorageUsageLevelName;
	siteId: number;
	daysOfBackupsSaved: number;
	minDaysOfBackupsAllowed: number;
};

type UpsellPriceProps = {
	upsellSlug: SelectorProduct | null;
	originalPrice: number;
	isPriceFetching: boolean | null;
	currencyCode: string | null;
};
export const UpsellPrice: React.FC< UpsellPriceProps > = ( {
	upsellSlug,
	originalPrice,
	isPriceFetching,
	currencyCode,
} ) => {
	const priceClass = clsx( 'usage-warning__upsell-price', {
		'is-placeholder': isPriceFetching,
	} );

	const billingTerm = upsellSlug?.displayTerm || upsellSlug?.term || 'TERM_MONTHLY';
	return (
		<span className={ priceClass }>
			<PlanPrice displayFlatPrice rawPrice={ originalPrice } currencyCode={ currencyCode } />{ ' ' }
			<TimeFrame billingTerm={ billingTerm } />
		</span>
	);
};

const UsageWarningUpsell: React.FC< UpsellProps > = ( {
	siteSlug,
	bytesUsed,
	usageLevel,
	siteId,
	daysOfBackupsSaved,
	minDaysOfBackupsAllowed,
} ) => {
	const dispatch = useDispatch();
	const { upsellSlug, ...priceInfo } = useUpsellInfo( siteId );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_upsell_display', {
				type: usageLevel,
				bytes_used: bytesUsed,
			} )
		);
	}, [ dispatch, usageLevel, bytesUsed ] );

	const onClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_upsell_click', {
				type: usageLevel,
				bytes_used: bytesUsed,
			} )
		);
	}, [ dispatch, usageLevel, bytesUsed ] );

	const price = <UpsellPrice { ...priceInfo } upsellSlug={ upsellSlug } />;
	const storageUpgradeUrl = buildCheckoutURL( siteSlug, upsellSlug.productSlug, {
		// When attempting to purchase a 2nd identical storage add-on product, this
		// 'source' flag tells the shopping cart to force "purchase" another storage add-on
		// as opposed to renew the existing one.
		source: 'backup-storage-purchase-not-renewal',
	} );

	return (
		<ActionButton
			className="usage-warning__upsell"
			usageLevel={ usageLevel }
			upsellSlug={ upsellSlug }
			href={ storageUpgradeUrl }
			onClick={ onClick }
			price={ price }
			storage={ upsellSlug.storage }
			daysOfBackupsSaved={ daysOfBackupsSaved }
			minDaysOfBackupsAllowed={ minDaysOfBackupsAllowed }
		/>
	);
};

export default UsageWarningUpsell;
