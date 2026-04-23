import page from '@automattic/calypso-router';
import { Page } from '@wordpress/admin-ui';
import { TabPanel } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import QueryTerms from 'calypso/components/data/query-terms';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PodcastEpisodes from './components/episodes';
import PodcastSettings from './components/settings';
import PodcastSetup from './components/setup';

import './style.scss';

type PodcastSection = 'episodes' | 'settings' | 'setup';

type PodcastMainProps = {
	section?: string;
	path?: string;
};

const VALID_SECTIONS: readonly PodcastSection[] = [ 'settings', 'setup' ] as const;

const isValidSection = ( s: string | undefined ): s is 'settings' | 'setup' =>
	!! s && ( VALID_SECTIONS as readonly string[] ).includes( s );

const PodcastMain = ( { section, path }: PodcastMainProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const pathSuffix = siteSlug ? '/' + siteSlug : '';

	const currentSection: PodcastSection = isValidSection( section ) ? section : 'episodes';

	const tabs = [
		{
			name: 'episodes',
			title: translate( 'Episodes' ) as string,
			path: '/podcast' + pathSuffix,
		},
		{
			name: 'settings',
			title: translate( 'Settings' ) as string,
			path: '/podcast/settings' + pathSuffix,
		},
		{
			name: 'setup',
			title: translate( 'Setup' ) as string,
			path: '/podcast/setup' + pathSuffix,
		},
	];

	const currentPath = ( path || '' ).split( '?' )[ 0 ];

	const renderContent = () => {
		switch ( currentSection ) {
			case 'settings':
				return <PodcastSettings />;
			case 'setup':
				return <PodcastSetup />;
			default:
				return <PodcastEpisodes />;
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
					<div className="podcast__tabs-bar">
						<TabPanel
							key={ currentSection }
							className="podcast__tabs"
							activeClass="is-active"
							tabs={ tabs }
							initialTabName={ currentSection }
							onSelect={ ( tabName ) => {
								const target = tabs.find( ( t ) => t.name === tabName );
								if ( target && currentPath !== target.path ) {
									page.show( target.path );
								}
							} }
						>
							{ () => null }
						</TabPanel>
					</div>
					<div className="podcast__tab-content">{ renderContent() }</div>
				</div>
			</Page>
			<JetpackFooter />
		</Main>
	);
};

export default PodcastMain;
