import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TimeFrame from 'calypso/components/jetpack/card/jetpack-product-card/display-price/time-frame';
import PlanPrice from 'calypso/my-sites/plan-price';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { SelectorProduct } from 'calypso/my-sites/plans/jetpack-plans/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import ActionButton from './action-button';
import useUpsellInfo from './use-upsell-slug';
import type { StorageUsageLevelName } from '../storage-usage-levels';
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
const UpsellPrice: React.FC< UpsellPriceProps > = ( {
	upsellSlug,
	originalPrice,
	isPriceFetching,
	currencyCode,
} ) => {
	const priceClass = classNames( 'usage-warning__upsell-price', {
		'is-placeholder': isPriceFetching,
	} );

	const billingTerm = upsellSlug?.displayTerm || upsellSlug?.term || 'TERM_MONTHLY';
	return (
		<span className={ priceClass }>
			<PlanPrice displayFlatPrice rawPrice={ originalPrice } currencyCode={ currencyCode } />
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
	const storageUpgradeUrl = buildCheckoutURL( siteSlug, upsellSlug.productSlug, {} );

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
