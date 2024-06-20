import { Card } from '@automattic/components';
import { StepContainer, SubTitle, Title } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useHostingProviderQuery } from 'calypso/data/site-profiler/use-hosting-provider-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import useHostingProviderName from 'calypso/site-profiler/hooks/use-hosting-provider-name';
import type { Step } from '../../types';

import './style.scss';

const SiteMigrationHowToMigrate: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const site = useSite();
	const importSiteQueryParam = useQuery().get( 'from' ) || '';
	usePresalesChat( 'wpcom', true, true );

	const options = useMemo(
		() => [
			{
				label: translate( 'Do it for me' ),
				description: translate(
					"Share your site with us, and we'll review it and handle the migration if possible."
				),
				value: 'difm',
				selected: true,
			},
			{
				label: translate( "I'll do it myself" ),
				description: translate(
					'Install the plugin yourself, find the migration key and migrate the site.'
				),
				value: 'myself',
			},
		],
		[ translate ]
	);

	let importSiteHostName = '';

	try {
		importSiteHostName = new URL( importSiteQueryParam )?.hostname;
	} catch ( e ) {}

	const { data: urlData } = useAnalyzeUrlQuery( importSiteQueryParam, true );
	const { data: hostingProviderData } = useHostingProviderQuery( importSiteHostName, true );
	const hostingProviderName = useHostingProviderName(
		hostingProviderData?.hosting_provider,
		urlData
	);

	const hostingProviderSlug = hostingProviderData?.hosting_provider?.slug;
	const shouldDisplayHostIdentificationMessage =
		hostingProviderSlug &&
		hostingProviderSlug !== 'unknown' &&
		hostingProviderSlug !== 'automattic';

	const canInstallPlugins = site?.plan?.features?.active.find(
		( feature ) => feature === 'install-plugins'
	)
		? true
		: false;

	const handleClick = ( how: string ) => {
		const destination = canInstallPlugins ? 'migrate' : 'upgrade';
		return navigation.submit?.( { how, destination } );
	};

	const stepContent = (
		<>
			<Title>{ translate( 'How do you want to migrate?' ) }</Title>

			{ shouldDisplayHostIdentificationMessage && (
				<SubTitle>
					{
						// translators: %(hostingProviderName)s is the name of a hosting provider (e.g. WP Engine).
						translate( 'Your WordPress site is hosted with %(hostingProviderName)s.', {
							args: { hostingProviderName },
						} )
					}
				</SubTitle>
			) }

			<div className="how-to-migrate__list">
				{ options.map( ( option, i ) => (
					<Card
						tagName="button"
						displayAsLink
						key={ i }
						onClick={ () => handleClick( option.value ) }
					>
						<div className="how-to-migrate__header">
							<h2 className="how-to-migrate__name">{ option.label }</h2>
						</div>

						<p className="how-to-migrate__description">{ option.description }</p>
					</Card>
				) ) }
			</div>
		</>
	);

	return (
		<>
			<DocumentHead title={ translate( 'How do you want to migrate?' ) } />
			<StepContainer
				stepName="site-migration-how-to-migrate"
				className="how-to-migrate"
				shouldHideNavButtons={ false }
				hideSkip
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
				goBack={ navigation.goBack }
			/>
		</>
	);
};

export default SiteMigrationHowToMigrate;
