import { siteBySlugQuery, siteRedirectQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

export default function RedirectsSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: redirect } = useSuspenseQuery( siteRedirectQuery( site.ID ) );

	const hasRedirect = redirect && Object.keys( redirect ).length > 0;

	const renderManageRedirect = () => {
		return <div>Manage redirect</div>;
	};

	const renderCreateRedirect = () => {
		return <div>Create redirect</div>;
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Redirects' ) }
					description="Placeholder text for redirects settings"
				/>
			}
		>
			{ hasRedirect ? renderManageRedirect() : renderCreateRedirect() }
		</PageLayout>
	);
}
