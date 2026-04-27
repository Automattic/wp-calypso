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
import { useSelector } from 'calypso/state';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import { getTerms } from 'calypso/state/terms/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import Distribution from './components/distribution';
import Episodes from './components/episodes';
import Welcome, { type PlanTier } from './components/welcome';
import useAccessGate from './hooks/use-access-gate';

import './style.scss';

type PodcastSection = 'episodes' | 'distribution';

type PodcastMainProps = {
	section?: string;
	path?: string;
};

const VALID_SECTIONS: readonly PodcastSection[] = [ 'episodes', 'distribution' ] as const;

const isValidSection = ( s: string | undefined ): s is PodcastSection =>
	!! s && ( VALID_SECTIONS as readonly string[] ).includes( s );

const PodcastMain = ( { section, path }: PodcastMainProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const accessGate = useAccessGate();
	// Match the Episodes-tab resolution: prefer the legacy setting, then fall
	// back to a category named "Podcast" so sites with episodes already
	// flowing through that term land on Episodes by default.
	const isSetUp = useSelector( ( state ) => {
		if ( ! siteId ) {
			return false;
		}
		if ( getPodcastingCategoryId( state, siteId ) ) {
			return true;
		}
		const terms = getTerms( state, siteId, 'category' );
		return Array.isArray( terms )
			? terms.some( ( term ) => term?.name?.toLowerCase?.() === 'podcast' )
			: false;
	} );
	const pathSuffix = siteSlug ? '/' + siteSlug : '';

	// Welcome shows when podcasting is not set up on this site. The local
	// enable flag lets the prototype Enable button flip the view without
	// touching the real podcasting_category_id setting.
	const [ enabled, setEnabled ] = useState( false );
	const podcastingOn = enabled || isSetUp;
	const [ planTier, setPlanTier ] = useState< PlanTier >( 'free' );
	const hasSectionInRoute = isValidSection( section );
	const showTabs = podcastingOn || hasSectionInRoute;

	const currentSection: PodcastSection = isValidSection( section ) ? section : 'episodes';

	const tabs = [
		{
			name: 'episodes',
			title: translate( 'Episodes' ) as string,
			path: '/podcast/episodes' + pathSuffix,
		},
		{
			name: 'distribution',
			title: translate( 'Distribution' ) as string,
			path: '/podcast/distribution' + pathSuffix,
		},
	];

	const currentPath = ( path || '' ).split( '?' )[ 0 ];

	const handleSelect = ( tabId: string ) => {
		const target = tabs.find( ( t ) => t.name === tabId );
		if ( target && currentPath !== target.path ) {
			page.show( target.path );
		}
	};

	let pageContent;
	if ( accessGate ) {
		pageContent = accessGate;
	} else if ( showTabs ) {
		pageContent = (
			<Tabs.Root
				value={ currentSection }
				onValueChange={ ( value ) => {
					if ( typeof value === 'string' ) {
						handleSelect( value );
					}
				} }
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
						<Episodes />
					</div>
				</Tabs.Panel>
				<Tabs.Panel value="distribution">
					<div className="podcast__tab-content">
						<Distribution />
					</div>
				</Tabs.Panel>
			</Tabs.Root>
		);
	} else {
		pageContent = (
			<div className="podcast__tab-content">
				<Welcome
					onEnable={ () => setEnabled( true ) }
					planTier={ planTier }
					onChangePlanTier={ setPlanTier }
				/>
			</div>
		);
	}

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
				<div className="podcast__scroll-area">{ pageContent }</div>
			</Page>
			<JetpackFooter />
		</Main>
	);
};

export default PodcastMain;
