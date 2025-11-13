import { siteBySlugQuery, siteSettingsQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { AIAssistantForm } from './ai-assistant-form';

export default function AISiteAssistantSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: settings } = useQuery( siteSettingsQuery( site.ID ) );

	if ( ! settings ) {
		return null;
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'AI Site Assistant' ) }
					description={ __( 'Early features for testing and feedback.' ) }
				/>
			}
		>
			<AIAssistantForm site={ site } settings={ settings } />
		</PageLayout>
	);
}
