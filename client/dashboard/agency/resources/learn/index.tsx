import { agencyEnablementResourcesQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { formatAgencyResources } from './format-resources';
import ResourceCenter, { getResourceCenterDescription } from './resource-center';

export default function Learn() {
	const { recordTracksEvent } = useAnalytics();
	const { data } = useSuspenseQuery( agencyEnablementResourcesQuery() );
	const resources = useMemo( () => formatAgencyResources( data.results ), [ data ] );

	return (
		<PageLayout
			header={
				<PageHeader title={ __( 'Library' ) } description={ getResourceCenterDescription() } />
			}
		>
			{ /*
			 * TODO: `onResourceClick` is not passed here, so the dashboard does not
			 * record server-side resource engagement the way a8c-for-agencies does
			 * (via its record-resource-event mutation). Add a dashboard equivalent.
			 */ }
			<ResourceCenter resources={ resources } recordTracksEvent={ recordTracksEvent } />
		</PageLayout>
	);
}
