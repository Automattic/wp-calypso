import { useJetpack1TbStorageAmountText } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { StorageUsageLevels } from '../storage-usage-levels';
import ActionButton from './action-button';

import './style.scss';

type OwnProps = {
	siteSlug: string;
	bytesUsed: number;
	usageLevel: StorageUsageLevels;
};

const UsageWarningUpsell: React.FC< OwnProps > = ( { siteSlug, bytesUsed, usageLevel } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_upsell_display', {
				type: StorageUsageLevels[ usageLevel ],
				bytes_used: bytesUsed,
			} )
		);
	}, [ dispatch, usageLevel, bytesUsed ] );

	const onClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_upsell_click', {
				type: StorageUsageLevels[ usageLevel ],
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

	return (
		<ActionButton
			className="usage-warning__upsell"
			usageLevel={ usageLevel }
			actionText={ actionText }
			href={ isJetpackCloud() ? `/pricing/backup/${ siteSlug }` : `/plans/${ siteSlug }` }
			onClick={ onClick }
		/>
	);
};

export default UsageWarningUpsell;
