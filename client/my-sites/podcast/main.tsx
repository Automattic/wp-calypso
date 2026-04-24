import page from '@automattic/calypso-router';
import { Page } from '@wordpress/admin-ui';
import { Tabs } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import QueryTerms from 'calypso/components/data/query-terms';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import { PodcastingV2Body } from 'calypso/my-sites/site-settings/podcasting-v2';
import PodcastingDistribution from 'calypso/my-sites/site-settings/podcasting-v2/distribution';
import PodcastingWelcome, {
	type PlanTier,
} from 'calypso/my-sites/site-settings/podcasting-v2/welcome';
import { useSelector } from 'calypso/state';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PodcastEpisodes from './components/episodes';

import './style.scss';

type PodcastSection = 'episodes' | 'settings' | 'distribution';

type PodcastMainProps = {
	section?: string;
	path?: string;
};

const VALID_SECTIONS: readonly PodcastSection[] = [ 'settings', 'distribution' ] as const;

const isValidSection = ( s: string | undefined ): s is 'settings' | 'distribution' =>
	!! s && ( VALID_SECTIONS as readonly string[] ).includes( s );

const PodcastMain = ( { section, path }: PodcastMainProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const categoryId = useSelector( ( state ) =>
		siteId ? getPodcastingCategoryId( state, siteId ) : null
	);
	const isSetUp = !! categoryId;
	const pathSuffix = siteSlug ? '/' + siteSlug : '';

	// Prototype: feature is off by default so the welcome is the first thing
	// people see. Flipping this on reveals the tabbed experience.
	const [ podcastingOn, setPodcastingOn ] = useState( false );
	const [ planTier, setPlanTier ] = useState< PlanTier >( 'free' );

	// If the URL doesn't pin a tab, first-time users (no podcast category set)
	// land on Settings so they can finish setup before seeing the empty Episodes list.
	const defaultSection: PodcastSection = isSetUp ? 'episodes' : 'settings';
	const currentSection: PodcastSection = isValidSection( section ) ? section : defaultSection;

	const tabs = [
		{
			name: 'episodes',
			title: translate( 'Episodes' ) as string,
			path: '/podcast' + pathSuffix,
		},
		{
			name: 'distribution',
			title: translate( 'Distribution' ) as string,
			path: '/podcast/distribution' + pathSuffix,
		},
		{
			name: 'settings',
			title: translate( 'Settings' ) as string,
			path: '/podcast/settings' + pathSuffix,
		},
	];

	const currentPath = ( path || '' ).split( '?' )[ 0 ];

	const handleSelect = ( tabId: string ) => {
		const target = tabs.find( ( t ) => t.name === tabId );
		if ( target && currentPath !== target.path ) {
			page.show( target.path );
		}
	};

	return (
		<Main fullWidthLayout className="podcast">
			{ siteId && <QuerySiteSettings siteId={ siteId } /> }
			{ siteId && <QueryTerms siteId={ siteId } taxonomy="category" /> }
			<DocumentHead title={ translate( 'Podcast' ) } />
			<Page
				hasPadding={ false }
				showSidebarToggle={ false }
				subTitle={ translate(
					'Publish a podcast feed to Apple Podcasts and other podcasting services. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="podcasting" showIcon={ false } />,
						},
					}
				) }
				title={ <JetpackTitle title={ translate( 'Podcast' ) } /> }
			>
				<div className="podcast__scroll-area">
					{ podcastingOn ? (
						<Tabs.Root
							value={ currentSection }
							onValueChange={ ( value ) => handleSelect( value as string ) }
						>
							<div className="podcast__tabs-bar">
								<Tabs.List className="podcast__tabs">
									{ tabs.map( ( tab ) => (
										<Tabs.Tab key={ tab.name } value={ tab.name }>
											{ tab.title }
										</Tabs.Tab>
									) ) }
								</Tabs.List>
							</div>
							<Tabs.Panel value="episodes">
								<div className="podcast__tab-content">
									<PodcastEpisodes />
								</div>
							</Tabs.Panel>
							<Tabs.Panel value="distribution">
								<div className="podcast__tab-content">
									<PodcastingDistribution />
								</div>
							</Tabs.Panel>
							<Tabs.Panel value="settings">
								<div className="podcast__tab-content">
									<PodcastingV2Body
										embedded
										podcastingOn={ podcastingOn }
										onChangePodcasting={ setPodcastingOn }
									/>
								</div>
							</Tabs.Panel>
						</Tabs.Root>
					) : (
						<div className="podcast__tab-content podcasting-v2">
							<PodcastingWelcome
								onEnable={ () => setPodcastingOn( true ) }
								planTier={ planTier }
								onChangePlanTier={ setPlanTier }
							/>
						</div>
					) }
				</div>
			</Page>
			<JetpackFooter />
		</Main>
	);
};

export default PodcastMain;
