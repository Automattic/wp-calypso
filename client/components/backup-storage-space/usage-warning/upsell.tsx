import { useJetpack1TbStorageAmountText } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getJetpackStorageUpgradeUrl from 'calypso/state/plans/selectors/get-jetpack-storage-upgrade-url';
import ActionButton from './action-button';
import type { StorageUsageLevelName } from '../storage-usage-levels';

import './style.scss';

type OwnProps = {
	siteSlug: string;
	bytesUsed: number;
	usageLevel: StorageUsageLevelName;
};

const UsageWarningUpsell: React.FC< OwnProps > = ( { siteSlug, bytesUsed, usageLevel } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

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

	const upgradeStorageAmount = useJetpack1TbStorageAmountText();
	const actionText = preventWidows(
		translate( 'Upgrade your backup storage to %(upgradeStorageAmount)s', {
			args: { upgradeStorageAmount },
			comment: 'upgradeStorageAmount is an abbreviated storage amount; e.g., 1TB',
		} )
	);

	const storageUpgradeUrl = useSelector( ( state ) =>
		getJetpackStorageUpgradeUrl( state, siteSlug )
	);

	return (
		<ActionButton
			className="usage-warning__upsell"
			usageLevel={ usageLevel }
			actionText={ actionText }
			href={ storageUpgradeUrl }
			onClick={ onClick }
		/>
	);
};

export default UsageWarningUpsell;
