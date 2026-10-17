import { isFlagged } from '@automattic/api-core';
import { siteBackupKnownThreatsQuery, siteBackupThreatsQuery } from '@automattic/api-queries';
import { WPCOM_FEATURES_SCAN_SELF_SERVE } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import { CheckboxControl, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	BackupKnownThreatsTable,
	KnownThreatsToggleButton,
	RestoreThatOneInsteadLink,
} from 'calypso/components/jetpack/daily-backup-status/known-threats';
import Notice from 'calypso/dashboard/components/notice';
import { Text } from 'calypso/dashboard/components/text';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { FunctionComponent } from 'react';

interface Props {
	siteId: number;
	rewindId: string;
	requireAcknowledgement: boolean;
	acknowledged?: boolean;
	onAcknowledgedChange?: ( value: boolean ) => void;
	onKnownThreatsChange?: ( hasKnownThreats: boolean ) => void;
}

export const isRestoreDisabled = (
	noSelection: boolean,
	hasKnownThreats: boolean,
	acknowledged: boolean
) => noSelection || ( hasKnownThreats && ! acknowledged );

export const getKnownThreatsTracksProps = ( hasKnownThreats: boolean, acknowledged: boolean ) => ( {
	known_threats_shown: hasKnownThreats,
	known_threats_acknowledged: hasKnownThreats && acknowledged,
} );

const KnownThreatsNotice: FunctionComponent< Props > = ( {
	siteId,
	rewindId,
	requireAcknowledgement,
	acknowledged = false,
	onAcknowledgedChange,
	onKnownThreatsChange,
} ) => {
	const translate = useTranslate();
	const [ isOpen, setIsOpen ] = useState( false );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const hasScan = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN_SELF_SERVE )
	);
	const { data: counts } = useQuery( siteBackupKnownThreatsQuery( siteId, rewindId ) );
	const { data: threats } = useQuery( {
		...siteBackupThreatsQuery( siteId, counts?.backupPeriod ?? 0 ),
		enabled: hasScan && isOpen && counts?.backupPeriod != null,
	} );

	const knownThreats = counts?.knownThreats;
	const hasKnownThreats = !! knownThreats && isFlagged( knownThreats );

	useEffect( () => {
		onKnownThreatsChange?.( hasKnownThreats );
	}, [ hasKnownThreats, onKnownThreatsChange ] );

	if ( ! knownThreats || ! hasKnownThreats ) {
		return null;
	}

	return (
		<Notice variant="warning">
			<VStack spacing={ 3 }>
				<Text>
					{ translate(
						'This backup is known to contain %d security threat. Restoring it may bring malware back to your site.',
						'This backup is known to contain %d security threats. Restoring it may bring malware back to your site.',
						{
							count: knownThreats.flagged,
							args: knownThreats.flagged,
							comment: '%d is the number of known security threats in the backup',
						}
					) }
				</Text>
				{ siteSlug && (
					<RestoreThatOneInsteadLink
						siteSlug={ siteSlug }
						latestWithoutKnownThreats={ counts.latestWithoutKnownThreats }
						currentRewindId={ rewindId }
					/>
				) }
				{ hasScan && (
					<div>
						<KnownThreatsToggleButton
							flagged={ knownThreats.flagged }
							isOpen={ isOpen }
							onToggle={ () => setIsOpen( ( open ) => ! open ) }
						/>
						{ isOpen && threats && siteSlug && (
							<BackupKnownThreatsTable
								siteSlug={ siteSlug }
								threats={ threats }
								latestWithoutKnownThreats={ counts.latestWithoutKnownThreats }
								currentRewindId={ rewindId }
								showRestoreLink={ false }
							/>
						) }
					</div>
				) }
				{ requireAcknowledgement && (
					<CheckboxControl
						__nextHasNoMarginBottom
						checked={ acknowledged }
						onChange={ ( value ) => onAcknowledgedChange?.( value ) }
						label={ translate(
							'I understand this backup contains known threats and want to restore it anyway.'
						) }
					/>
				) }
			</VStack>
		</Notice>
	);
};

export default KnownThreatsNotice;
