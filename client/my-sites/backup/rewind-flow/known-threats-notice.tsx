import { isFlagged } from '@automattic/api-core';
import { siteBackupKnownThreatsQuery, siteBackupThreatsQuery } from '@automattic/api-queries';
import { WPCOM_FEATURES_SCAN_SELF_SERVE } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import { speak } from '@wordpress/a11y';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useId, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	BackupKnownThreatsList,
	getKnownThreatsWarning,
	KnownThreatsRegion,
	KnownThreatsToggleButton,
	RestoreThatOneInsteadLink,
} from 'calypso/components/jetpack/daily-backup-status/known-threats';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import RewindFlowNotice, { RewindFlowNoticeLevel } from './rewind-flow-notice';
import type { FunctionComponent } from 'react';

import './known-threats-notice.scss';

interface Props {
	siteId: number;
	rewindId: string;
	requireAcknowledgement: boolean;
	acknowledged?: boolean;
	onAcknowledgedChange?: ( value: boolean ) => void;
	onKnownThreatsChange?: ( hasKnownThreats: boolean ) => void;
	/** Said when the box is ticked; say where the restore button is if it isn't the next stop. */
	acknowledgedMessage?: string;
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
	acknowledgedMessage,
} ) => {
	const translate = useTranslate();
	const [ isOpen, setIsOpen ] = useState( false );
	const threatsRegionId = useId();
	const siteSlug = useSelector( getSelectedSiteSlug );
	const hasScan = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN_SELF_SERVE )
	);
	const { data: counts } = useQuery( siteBackupKnownThreatsQuery( siteId, rewindId ) );
	const { data: threats, isError: isThreatsError } = useQuery( {
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
		<RewindFlowNotice
			gridicon="notice"
			title={ getKnownThreatsWarning( translate, knownThreats.flagged ) }
			type={ RewindFlowNoticeLevel.WARNING }
		>
			<div className="rewind-flow-known-threats">
				{ hasScan && (
					<div className="rewind-flow-known-threats__details">
						<KnownThreatsToggleButton
							flagged={ knownThreats.flagged }
							isOpen={ isOpen }
							onToggle={ () => setIsOpen( ( open ) => ! open ) }
							controlsId={ threatsRegionId }
						/>
						{ isOpen && (
							<KnownThreatsRegion id={ threatsRegionId } isError={ isThreatsError || ! siteSlug }>
								{ threats && siteSlug && (
									<BackupKnownThreatsList
										siteId={ siteId }
										siteSlug={ siteSlug }
										threats={ threats }
										latestWithoutKnownThreats={ counts.latestWithoutKnownThreats }
										currentBackupPeriod={ counts.backupPeriod }
										showRestoreLink={ false }
									/>
								) }
							</KnownThreatsRegion>
						) }
					</div>
				) }
				{ siteSlug && (
					<RestoreThatOneInsteadLink
						siteId={ siteId }
						siteSlug={ siteSlug }
						latestWithoutKnownThreats={ counts.latestWithoutKnownThreats }
						currentBackupPeriod={ counts.backupPeriod }
					/>
				) }
				{ requireAcknowledgement && (
					<div className="rewind-flow-known-threats__acknowledgement">
						<CheckboxControl
							__nextHasNoMarginBottom
							checked={ acknowledged }
							onChange={ ( value ) => {
								onAcknowledgedChange?.( value );
								// Focus stays on the checkbox; say that the restore it was blocking is open.
								if ( value ) {
									speak(
										acknowledgedMessage ??
											( translate( 'You can now restore this backup.' ) as string )
									);
								}
							} }
							label={ translate(
								'I understand this backup contains known threats and want to restore it anyway.'
							) }
						/>
					</div>
				) }
			</div>
		</RewindFlowNotice>
	);
};

export default KnownThreatsNotice;
