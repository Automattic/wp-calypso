import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RedirectsSettings( { siteSlug }: { siteSlug: string } ) {
	const renderContent = () => {
		return <>Work in progress</>;
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Redirects' ) }
					description={ createInterpolateElement(
						__( 'Control who can view your site. <link>Learn more</link>' ),
						{
							link: <InlineSupportLink supportContext="privacy" />,
						}
					) }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
