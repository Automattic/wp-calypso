import { HostingFeatures, isFlagged } from '@automattic/api-core';
import { siteBackupKnownThreatsQuery, siteBackupThreatsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, CheckboxControl, __experimentalVStack as VStack } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import Notice from '../../components/notice';
import { hasHostingFeature } from '../../utils/site-features';
import { KnownThreatsTable } from '../backups/known-threats/known-threats-table';
import { RestoreThatOneInsteadLink } from '../backups/known-threats/restore-that-one-instead-link';
import type { Site } from '@automattic/api-core';

interface KnownThreatsNoticeProps {
	site: Site;
	restoreLinkTo?: string;
	rewindId: string;
	requireAcknowledgement: boolean;
	acknowledged?: boolean;
	onAcknowledgedChange?: ( value: boolean ) => void;
	onKnownThreatsChange?: ( hasKnownThreats: boolean ) => void;
}

export default function KnownThreatsNotice( {
	site,
	restoreLinkTo,
	rewindId,
	requireAcknowledgement,
	acknowledged = false,
	onAcknowledgedChange,
	onKnownThreatsChange,
}: KnownThreatsNoticeProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const hasScan = hasHostingFeature( site, HostingFeatures.SCAN_SELF_SERVE );
	const { data: counts } = useQuery( siteBackupKnownThreatsQuery( site.ID, rewindId ) );
	const { data: threats } = useQuery( {
		...siteBackupThreatsQuery( site.ID, rewindId ),
		enabled: hasScan && isOpen,
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
				<p>
					{ sprintf(
						// translators: %d is the number of known security threats in the backup
						_n(
							'This backup is known to contain %d security threat. Restoring it may bring malware back to your site.',
							'This backup is known to contain %d security threats. Restoring it may bring malware back to your site.',
							knownThreats.flagged
						),
						knownThreats.flagged
					) }
				</p>
				<RestoreThatOneInsteadLink
					siteSlug={ site.slug }
					restoreLinkTo={ restoreLinkTo }
					latestWithoutKnownThreats={ counts.latestWithoutKnownThreats }
					currentRewindId={ rewindId }
				/>
				{ hasScan && (
					<div>
						<Button
							variant="link"
							aria-expanded={ isOpen }
							onClick={ () => setIsOpen( ( open ) => ! open ) }
						>
							{ isOpen ? __( 'Hide threats' ) : __( 'Show threats' ) }
						</Button>
						{ isOpen && threats && (
							<KnownThreatsTable
								siteSlug={ site.slug }
								restoreLinkTo={ restoreLinkTo }
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
						checked={ acknowledged }
						onChange={ ( value ) => onAcknowledgedChange?.( value ) }
						label={ __(
							'I understand this backup contains known threats and want to restore it anyway.'
						) }
					/>
				) }
			</VStack>
		</Notice>
	);
}
