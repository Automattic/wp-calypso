import { siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function AISiteAssistantSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );

	if ( ! site ) {
		return null;
	}

	// console.log( 'site', site );

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
			<Text as="p">
				{ __( 'There are no AI Site Assistant settings available for this site yet.' ) }
			</Text>
		</PageLayout>
	);
}
