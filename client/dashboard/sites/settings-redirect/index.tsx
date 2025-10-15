import { siteBySlugQuery, siteRedirectQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import CreateSiteRedirect from './create-site-redirect';
import ManageSiteRedirect from './manage-site-redirect';

export default function RedirectsSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: redirect } = useSuspenseQuery( siteRedirectQuery( site.ID ) );

	const hasRedirect = redirect && Object.keys( redirect ).length > 0;

	const renderContent = () => {
		if ( site.is_wpcom_atomic ) {
			return (
				<Notice variant="error">{ __( 'Site Redirects are not available for this site.' ) }</Notice>
			);
		}
		if ( hasRedirect ) {
			return <ManageSiteRedirect siteId={ site.ID } currentRedirect={ redirect.location } />;
		}
		return <CreateSiteRedirect siteSlug={ site.slug } siteId={ site.ID } />;
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Redirects' ) }
					description={ __( 'Redirect your site to another address' ) }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
