import { HostingFeatures, isFlagged } from '@automattic/api-core';
import { siteBackupKnownThreatsQuery, siteBackupThreatsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { hasHostingFeature } from '../../../utils/site-features';
import { KnownThreatsBadge } from './known-threats-badge';
import { KnownThreatsTable } from './known-threats-table';
import type { Site } from '@automattic/api-core';

export function KnownThreatsSection( { site, rewindId }: { site: Site; rewindId: string } ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const hasScan = hasHostingFeature( site, HostingFeatures.SCAN_SELF_SERVE );
	const { data: counts } = useQuery( siteBackupKnownThreatsQuery( site.ID, rewindId ) );
	const { data: threats } = useQuery( {
		...siteBackupThreatsQuery( site.ID, rewindId ),
		enabled: hasScan && isOpen,
	} );

	if ( ! counts?.knownThreats || ! isFlagged( counts.knownThreats ) ) {
		return null;
	}

	const badge = <KnownThreatsBadge count={ counts.knownThreats.flagged } />;

	if ( ! hasScan ) {
		return <div>{ badge }</div>;
	}

	return (
		<div>
			<Button
				variant="tertiary"
				size="compact"
				aria-expanded={ isOpen }
				onClick={ () => setIsOpen( ( open ) => ! open ) }
			>
				{ badge }
				<span>{ isOpen ? __( 'Hide threats' ) : __( 'Show threats' ) }</span>
			</Button>
			{ isOpen && threats && (
				<KnownThreatsTable
					threats={ threats }
					latestWithoutKnownThreats={ counts.latestWithoutKnownThreats }
					currentRewindId={ rewindId }
				/>
			) }
		</div>
	);
}
