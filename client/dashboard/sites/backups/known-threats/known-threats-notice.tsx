import { HostingFeatures, isFlagged } from '@automattic/api-core';
import { siteBackupKnownThreatsQuery, siteBackupThreatsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { speak } from '@wordpress/a11y';
import {
	CheckboxControl,
	__experimentalHStack as HStack,
	Spinner,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useId, useState } from 'react';
import Notice from '../../../components/notice';
import { Text } from '../../../components/text';
import { hasHostingFeature } from '../../../utils/site-features';
import { getKnownThreatsWarning, KnownThreatsToggle } from './known-threats-badge';
import { KnownThreatsList } from './known-threats-list';
import { RestoreThatOneInsteadLink } from './restore-that-one-instead-link';
import type { BackupKnownThreats, Site } from '@automattic/api-core';
import type { MutableRefObject } from 'react';

import './known-threats-notice.scss';

interface KnownThreatsNoticeProps {
	site: Site;
	restoreLinkTo?: string;
	rewindId: string;
	requireAcknowledgement: boolean;
	acknowledged?: boolean;
	onAcknowledgedChange?: ( value: boolean ) => void;
	onKnownThreatsChange?: ( hasKnownThreats: boolean ) => void;
	/** Set to the acknowledgement checkbox, so the caller can move focus to it. */
	acknowledgementRef?: MutableRefObject< HTMLInputElement | null >;
	/** Said when the box is ticked; say where the restore button is if it isn't the next stop. */
	acknowledgedMessage?: string;
	/** Counts from a server refusal to restore without the acknowledgement; flagged is 0 when it sent none. */
	refusedKnownThreats?: BackupKnownThreats | null;
}

export default function KnownThreatsNotice( {
	site,
	restoreLinkTo,
	rewindId,
	requireAcknowledgement,
	acknowledged = false,
	onAcknowledgedChange,
	onKnownThreatsChange,
	acknowledgementRef,
	acknowledgedMessage,
	refusedKnownThreats,
}: KnownThreatsNoticeProps ) {
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
	const hasScan = hasHostingFeature( site, HostingFeatures.SCAN_SELF_SERVE );
	const { data: counts } = useQuery( siteBackupKnownThreatsQuery( site.ID, rewindId ) );
	const { data: threats, isError: isThreatsError } = useQuery( {
		...siteBackupThreatsQuery( site.ID, counts?.backupPeriod ?? 0 ),
		enabled: hasScan && isOpen && counts?.backupPeriod != null,
	} );

	// The server refuses a restore it knows is flagged even when this lookup failed or missed it.
	const isRefused = ! isFlagged( counts?.knownThreats ) && !! refusedKnownThreats;
	const knownThreats = isRefused ? refusedKnownThreats : counts?.knownThreats;
	const flagged = knownThreats?.flagged ?? 0;
	const hasKnownThreats = isRefused || flagged > 0;

	let warning = '';
	if ( hasKnownThreats ) {
		warning =
			flagged > 0
				? getKnownThreatsWarning( flagged )
				: __( 'This backup is known to contain security threats. Acknowledge them to restore it.' );
	}

	useEffect( () => {
		onKnownThreatsChange?.( hasKnownThreats );
	}, [ hasKnownThreats, onKnownThreatsChange ] );

	// The warning arrives after the page has rendered, so screen readers would otherwise miss it.
	useEffect( () => {
		if ( hasKnownThreats ) {
			speak( warning );
		}
	}, [ hasKnownThreats, warning ] );

	if ( ! hasKnownThreats ) {
		return null;
	}

	return (
		<Notice variant="warning">
			<VStack spacing={ 3 }>
				<Text>{ warning }</Text>
				{ hasScan && flagged > 0 && counts?.backupPeriod != null && (
					<div>
						<KnownThreatsToggle
							isOpen={ isOpen }
							onToggle={ () => setIsOpen( ( open ) => ! open ) }
							controlsId={ threatsRegionId }
						/>
						{ isOpen && (
							<div id={ threatsRegionId }>
								{ threats && (
									<KnownThreatsList
										siteId={ site.ID }
										siteSlug={ site.slug }
										restoreLinkTo={ restoreLinkTo }
										threats={ threats }
										latestWithoutKnownThreats={ counts.latestWithoutKnownThreats }
										currentBackupPeriod={ counts.backupPeriod }
										showRestoreLink={ false }
									/>
								) }
								{ ! threats && isThreatsError && (
									<Text>{ __( "Couldn't load the threats. Try again later." ) }</Text>
								) }
								{ ! threats && ! isThreatsError && (
									<HStack alignment="left" spacing={ 2 }>
										<Spinner style={ { margin: 0 } } />
										<Text>{ __( 'Loading threats…' ) }</Text>
									</HStack>
								) }
							</div>
						) }
					</div>
				) }
				<RestoreThatOneInsteadLink
					siteId={ site.ID }
					siteSlug={ site.slug }
					restoreLinkTo={ restoreLinkTo }
					latestWithoutKnownThreats={ counts?.latestWithoutKnownThreats }
					currentBackupPeriod={ counts?.backupPeriod }
				/>
				{ requireAcknowledgement && (
					<div className="known-threats-notice__acknowledgement" ref={ acknowledgementWrapperRef }>
						<CheckboxControl
							__nextHasNoMarginBottom
							checked={ acknowledged }
							onChange={ ( value ) => {
								onAcknowledgedChange?.( value );
								// Focus stays on the checkbox; say that the restore it was blocking is open.
								if ( value ) {
									speak( acknowledgedMessage ?? __( 'You can now restore this backup.' ) );
								}
							} }
							label={ __(
								'I understand this backup contains known threats and want to restore it anyway.'
							) }
						/>
					</div>
				) }
			</VStack>
		</Notice>
	);
}
