import { bigSkyPluginQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { comment } from '@wordpress/icons';
import Breadcrumbs from '../../app/breadcrumbs';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import UpsellCallout from '../hosting-feature-gated-with-callout/upsell';
import upsellIllustrationUrl from './upsell-illustration.svg';

export default function AIToolsSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const { data: pluginStatus } = useSuspenseQuery( bigSkyPluginQuery( site.ID ) );
	// const isEnabled = pluginStatus?.enabled ?? false;
	const isAvailable = pluginStatus?.available ?? false;
	// const isFreeTrial = pluginStatus?.on_free_trial ?? false;

	const description = isAvailable
		? createInterpolateElement(
				__(
					'Create content, transform designs, generate images, and get instant help with AI. <learnMoreLink />'
				),
				{
					learnMoreLink: <InlineSupportLink supportContext="hosting-mysql" />,
				}
		  )
		: undefined;

	const renderContent = () => {
		if ( ! isAvailable ) {
			return (
				<UpsellCallout
					site={ site }
					upsellId="ai-tools"
					upsellTitle={ __( 'Your dream site is just a prompt away' ) }
					upsellDescription={ __(
						'Get AI-powered assistance to help you build, edit, and redesign your site with ease.'
					) }
					upsellIcon={ comment }
					upsellImage={ upsellIllustrationUrl }
				/>
			);
		}

		return null;
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'AI tools' ) }
					description={ description }
				/>
			}
		>
			{ renderContent() }
		</PageLayout>
	);
}
