import { isFlagged } from '@automattic/api-core';
import { siteBackupKnownThreatsQuery, siteBackupThreatsQuery } from '@automattic/api-queries';
import { WPCOM_FEATURES_SCAN_SELF_SERVE } from '@automattic/calypso-products';
import { useQuery } from '@tanstack/react-query';
import { speak } from '@wordpress/a11y';
import { CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useId, useState } from 'react';
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
import type { BackupKnownThreats } from '@automattic/api-core';
import type { FunctionComponent, MutableRefObject } from 'react';

import './known-threats-notice.scss';

interface Props {
	siteId: number;
	rewindId: string;
	requireAcknowledgement: boolean;
	acknowledged?: boolean;
	onAcknowledgedChange?: ( value: boolean ) => void;
	onKnownThreatsChange?: ( hasKnownThreats: boolean ) => void;
	/** Set to the acknowledgement checkbox, so the caller can move focus to it. */
	acknowledgementRef?: MutableRefObject< HTMLInputElement | null >;
	/** Said when the box is ticked; say where the restore button is if it isn't the next stop. */
	acknowledgedMessage?: string;
	/** Why the restore was held back, shown under the checkbox and tied to it. */
	acknowledgementError?: string | null;
	/** Counts from a server refusal to restore without the acknowledgement; flagged is 0 when it sent none. */
	refusedKnownThreats?: BackupKnownThreats | null;
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
	acknowledgementRef,
	acknowledgedMessage,
	acknowledgementError,
	refusedKnownThreats,
} ) => {
	const translate = useTranslate();
	const [ isOpen, setIsOpen ] = useState( false );
	const threatsRegionId = useId();
	// CheckboxControl doesn't forward a ref to its input.
	const acknowledgementWrapperRef = useCallback(
		( wrapper: HTMLDivElement | null ) => {
			if ( acknowledgementRef ) {
				acknowledgementRef.current = wrapper?.querySelector( 'input' ) ?? null;
			}
		},
		[ acknowledgementRef ]
	);
	const siteSlug = useSelector( getSelectedSiteSlug );
	const hasScan = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_SCAN_SELF_SERVE )
	);
	const { data: counts } = useQuery( siteBackupKnownThreatsQuery( siteId, rewindId ) );
	const { data: threats, isError: isThreatsError } = useQuery( {
		...siteBackupThreatsQuery( siteId, counts?.backupPeriod ?? 0 ),
		enabled: hasScan && isOpen && counts?.backupPeriod != null,
	} );

	// The server refuses a restore it knows is flagged even when this lookup failed or missed it.
	const isRefused = ! isFlagged( counts?.knownThreats ) && !! refusedKnownThreats;
	const knownThreats = isRefused ? refusedKnownThreats : counts?.knownThreats;
	const flagged = knownThreats?.flagged ?? 0;
	const hasKnownThreats = isRefused || flagged > 0;

	useEffect( () => {
		onKnownThreatsChange?.( hasKnownThreats );
	}, [ hasKnownThreats, onKnownThreatsChange ] );

	if ( ! hasKnownThreats ) {
		return null;
	}

	return (
		<RewindFlowNotice
			gridicon="notice"
			title={
				flagged > 0
					? getKnownThreatsWarning( translate, flagged )
					: translate(
							'This backup is known to contain security threats. Acknowledge them to restore it.'
						)
			}
			type={ RewindFlowNoticeLevel.WARNING }
		>
			<div className="rewind-flow-known-threats">
				{ hasScan && flagged > 0 && counts?.backupPeriod != null && (
					<div className="rewind-flow-known-threats__details">
						<KnownThreatsToggleButton
							flagged={ flagged }
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
						latestWithoutKnownThreats={ counts?.latestWithoutKnownThreats }
						currentBackupPeriod={ counts?.backupPeriod }
					/>
				) }
				{ requireAcknowledgement && (
					<div
						className="rewind-flow-known-threats__acknowledgement"
						ref={ acknowledgementWrapperRef }
					>
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
							// The help text is what the checkbox's aria-describedby points at.
							help={
								acknowledgementError ? (
									<span className="rewind-flow-known-threats__acknowledgement-error">
										{ acknowledgementError }
									</span>
								) : undefined
							}
						/>
					</div>
				) }
			</div>
		</RewindFlowNotice>
	);
};

export default KnownThreatsNotice;
