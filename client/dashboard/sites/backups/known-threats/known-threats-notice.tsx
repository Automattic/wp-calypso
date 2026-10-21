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
import { useEffect, useId, useState } from 'react';
import Notice from '../../../components/notice';
import { Text } from '../../../components/text';
import { hasHostingFeature } from '../../../utils/site-features';
import { getKnownThreatsWarning, KnownThreatsToggle } from './known-threats-badge';
import { KnownThreatsList } from './known-threats-list';
import { RestoreThatOneInsteadLink } from './restore-that-one-instead-link';
import type { Site } from '@automattic/api-core';

import './known-threats-notice.scss';

interface KnownThreatsNoticeProps {
	site: Site;
	restoreLinkTo?: string;
	rewindId: string;
	requireAcknowledgement: boolean;
	acknowledged?: boolean;
	onAcknowledgedChange?: ( value: boolean ) => void;
	onKnownThreatsChange?: ( hasKnownThreats: boolean ) => void;
	/** Said when the box is ticked; say where the restore button is if it isn't the next stop. */
	acknowledgedMessage?: string;
}

export default function KnownThreatsNotice( {
	site,
	restoreLinkTo,
	rewindId,
	requireAcknowledgement,
	acknowledged = false,
	onAcknowledgedChange,
	onKnownThreatsChange,
	acknowledgedMessage,
}: KnownThreatsNoticeProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const threatsRegionId = useId();
	const hasScan = hasHostingFeature( site, HostingFeatures.SCAN_SELF_SERVE );
	const { data: counts } = useQuery( siteBackupKnownThreatsQuery( site.ID, rewindId ) );
	const { data: threats, isError: isThreatsError } = useQuery( {
		...siteBackupThreatsQuery( site.ID, counts?.backupPeriod ?? 0 ),
		enabled: hasScan && isOpen && counts?.backupPeriod != null,
	} );

	const knownThreats = counts?.knownThreats;
	const hasKnownThreats = !! knownThreats && isFlagged( knownThreats );

	const warning = hasKnownThreats ? getKnownThreatsWarning( knownThreats.flagged ) : '';

	useEffect( () => {
		onKnownThreatsChange?.( hasKnownThreats );
	}, [ hasKnownThreats, onKnownThreatsChange ] );

	// The warning arrives after the page has rendered, so screen readers would otherwise miss it.
	useEffect( () => {
		if ( hasKnownThreats ) {
			speak( warning );
		}
	}, [ hasKnownThreats, warning ] );

	if ( ! knownThreats || ! hasKnownThreats ) {
		return null;
	}

	return (
		<Notice variant="warning">
			<VStack spacing={ 3 }>
				<Text>{ warning }</Text>
				{ hasScan && (
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
					latestWithoutKnownThreats={ counts.latestWithoutKnownThreats }
					currentBackupPeriod={ counts.backupPeriod }
				/>
				{ requireAcknowledgement && (
					<div className="known-threats-notice__acknowledgement">
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
