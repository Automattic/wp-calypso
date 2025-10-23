import { siteBySlugQuery, siteRedirectQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { useHelpCenter } from '../../app/help-center';
import { Notice } from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import CreateSiteRedirect from './create-site-redirect';
import ManageSiteRedirect from './manage-site-redirect';

export default function RedirectsSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: redirect } = useSuspenseQuery( siteRedirectQuery( site.ID ) );
	const { setShowHelpCenter } = useHelpCenter();

	const hasRedirect = redirect && Object.keys( redirect ).length > 0;

	const renderContent = () => {
		if ( site.is_wpcom_atomic ) {
			return (
				<Notice variant="error">
					{ createInterpolateElement(
						__(
							'Site Redirect is not available for this site. <contactSupportLink/> for assistance.'
						),
						{
							contactSupportLink: (
								<Button
									variant="link"
									onClick={ () => {
										setShowHelpCenter( true );
									} }
								>
									{ __( 'Contact support' ) }
								</Button>
							),
						}
					) }
				</Notice>
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
					title={ __( 'Site Redirect' ) }
					description={ __( 'Redirect your site to another address.' ) }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
