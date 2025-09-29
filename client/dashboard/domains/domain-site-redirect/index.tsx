import { domainQuery } from '@automattic/api-queries';
import { SITE_REDIRECT } from '@automattic/urls';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainRoute } from '../../app/router/domains';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import SiteRedirectForm from './form';

function DomainSiteRedirect() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Site redirect' ) }
					description={ createInterpolateElement(
						__( 'Update your site redirect. <link>Learn more</link>' ),
						{
							link: <InlineSupportLink supportLink={ SITE_REDIRECT } />,
						}
					) }
				/>
			}
		>
			<SiteRedirectForm siteId={ domain.blog_id } initialData={ { redirect: domain.domain } } />
		</PageLayout>
	);
}

export default DomainSiteRedirect;
