import { ExternalLink } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { PageHeader } from '../../components/page-header';
import { Text } from '../../components/text';
import { formatDate } from '../../utils/datetime';

interface AgencyOverviewHeaderInfoProps {
	url?: string;
	/** Injected by the host app; the dashboard's locale hook is not available in a8c-for-agencies. */
	locale: string;
	createdAt?: string;
}

/**
 * The agency's site link and join date. Rendered under the agency name by both
 * hosts: the dashboard's page header and the a8c-for-agencies layout header.
 */
export function AgencyOverviewHeaderInfo( {
	url,
	createdAt,
	locale,
}: AgencyOverviewHeaderInfoProps ) {
	const parsedDate = createdAt ? new Date( createdAt ) : undefined;
	const joinedDate = parsedDate && ! isNaN( parsedDate.getTime() ) ? parsedDate : undefined;

	return (
		<Text variant="muted" size={ 13 } lineHeight="20px">
			{ url && <ExternalLink href={ url }>{ url.replace( /^https?:\/\//, '' ) }</ExternalLink> }
			{ url && joinedDate && ' · ' }
			{ joinedDate &&
				sprintf(
					/* translators: %s is the date the agency joined the program. */
					__( 'Joined %s' ),
					formatDate( joinedDate, locale )
				) }
		</Text>
	);
}

export default function AgencyOverviewHeader( {
	name,
	url,
	createdAt,
	locale,
}: AgencyOverviewHeaderInfoProps & { name?: string } ) {
	return (
		<PageHeader
			title={ name }
			description={
				<AgencyOverviewHeaderInfo url={ url } createdAt={ createdAt } locale={ locale } />
			}
		/>
	);
}
