import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useDomainSearch } from '../../page/context';
import { DomainSearchNotice } from '../../ui';

export const SearchNotice = () => {
	const { query, queries } = useDomainSearch();
	const { data: availability } = useQuery( queries.domainAvailability( query ) );

	if ( availability?.status !== 'unavailable' ) {
		return null;
	}

	return (
		<DomainSearchNotice status="error">
			{ __( 'This domain is already mapped to a WordPress.com site.' ) }
		</DomainSearchNotice>
	);
};
