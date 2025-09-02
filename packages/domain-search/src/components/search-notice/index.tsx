import { DomainAvailabilityStatus } from '@automattic/api-core';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useDomainSearch } from '../../page/context';
import { DomainSearchNotice } from '../../ui';

export const SearchNotice = () => {
	const { query, queries } = useDomainSearch();
	const { error: suggestionError } = useQuery( queries.domainSuggestions( query ) );
	const { data: availability, error: availabilityError } = useQuery(
		queries.domainAvailability( query )
	);

	const errorMessage = suggestionError?.message ?? availabilityError?.message;

	if ( errorMessage ) {
		return <DomainSearchNotice status="error">{ errorMessage }</DomainSearchNotice>;
	}

	if ( availability?.status === DomainAvailabilityStatus.AVAILABLE ) {
		return null;
	}

	return (
		<DomainSearchNotice status="error">
			{ __( 'This domain is already mapped to a WordPress.com site.' ) }
		</DomainSearchNotice>
	);
};
