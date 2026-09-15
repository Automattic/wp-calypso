import { useQuery } from '@tanstack/react-query';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect } from 'react';
import { type NamePulseDomainResult, type NamePulseDomainUpdate } from '../../helpers/name-pulse';
import { useDomainSearch } from '../../page/context';
import { toRealtimeUpdate } from './result-card';
import { NamePulseResultsSection } from './results-section';

interface NamePulseFqdnRowProps {
	result: NamePulseDomainResult;
	onUpdate: ( update: NamePulseDomainUpdate ) => void;
}

/**
 * The typed domain itself, checked in real time (v1.3 `is-available`) rather
 * than against the zone-file index, so its status and price are authoritative.
 */
export const NamePulseFqdnRow = ( { result, onUpdate }: NamePulseFqdnRowProps ) => {
	const { __ } = useI18n();
	const { queries } = useDomainSearch();
	const domainName = result.domain_name;

	const { data: availability } = useQuery( {
		...queries.domainAvailability( domainName ),
		enabled: true,
	} );

	useEffect( () => {
		if ( availability ) {
			onUpdate( toRealtimeUpdate( domainName, availability ) );
		}
	}, [ availability, domainName, onUpdate ] );

	return (
		<NamePulseResultsSection
			id="fqdn"
			title={ __( 'Your domain' ) }
			results={ [ result ] }
			searchKey={ domainName }
			maxVisible={ 1 }
			onUpdate={ onUpdate }
		/>
	);
};
