import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';
import { Link } from '@wordpress/ui';
import { PageHeader } from '../../components/page-header';
import { Text } from '../../components/text';
import { formatDate } from '../../utils/datetime';

interface AgencyOverviewHeaderInfoProps {
	url?: string;
	/** Injected by the host app; the dashboard's locale hook is not available in a8c-for-agencies. */
	locale: string;
	createdAt?: string;
}

// Shared between the dashboard PageHeader and the a8c-for-agencies LayoutHeader.
export function AgencyOverviewHeaderInfo( {
	url,
	createdAt,
	locale,
}: AgencyOverviewHeaderInfoProps ) {
	const parsedDate = createdAt ? new Date( createdAt ) : undefined;
	const joinedDate = parsedDate && ! isNaN( parsedDate.getTime() ) ? parsedDate : undefined;

	return (
		<Text variant="muted" size={ 13 } lineHeight="20px">
			{ url && (
				<Link openInNewTab href={ url }>
					{ url.replace( /^https?:\/\//, '' ) }
				</Link>
			) }
			{ /* Wrap in span; avoids a Google Translate DOM crash (react/react#11538) */ }
			{ url && joinedDate && <span>{ ' · ' }</span> }
			{ /* Wrap in span; avoids a Google Translate DOM crash (react/react#11538) */ }
			{ joinedDate && (
				<span>
					{ sprintf(
						/* translators: %s is the date the agency joined the program. */
						__( 'Joined %s' ),
						formatDate( joinedDate, locale )
					) }
				</span>
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
			title={ name && decodeEntities( name ) }
			description={
				<AgencyOverviewHeaderInfo url={ url } createdAt={ createdAt } locale={ locale } />
			}
		/>
	);
}
