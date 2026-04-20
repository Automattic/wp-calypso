import page from '@automattic/calypso-router';
import { Page } from '@wordpress/admin-ui';
import { TabPanel } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import InlineSupportLink from 'calypso/components/inline-support-link';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import PodcastingEpisodes from './episodes';
import PodcastingFeedSettings from './feed-settings';
import PodcastingSetup from './setup';

import './style.scss';

type PodcastSection = 'episodes' | 'feed' | 'setup';

type PodcastingDetailsProps = {
	section?: string;
	path?: string;
};

const VALID_SECTIONS: readonly PodcastSection[] = [ 'feed', 'setup' ] as const;

const isValidSection = ( s: string | undefined ): s is 'feed' | 'setup' =>
	!! s && ( VALID_SECTIONS as readonly string[] ).includes( s );

const PodcastingDetails = ( { section, path }: PodcastingDetailsProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const pathSuffix = siteSlug ? '/' + siteSlug : '';

	const currentSection: PodcastSection = isValidSection( section ) ? section : 'episodes';

	const tabs = [
		{
			name: 'episodes',
			title: translate( 'Episodes' ) as string,
			path: '/settings/podcasting' + pathSuffix,
		},
		{
			name: 'feed',
			title: translate( 'Feed settings' ) as string,
			path: '/settings/podcasting/feed' + pathSuffix,
		},
		{
			name: 'setup',
			title: translate( 'Setup' ) as string,
			path: '/settings/podcasting/setup' + pathSuffix,
		},
	];

	const currentPath = ( path || '' ).split( '?' )[ 0 ];

	const renderContent = () => {
		switch ( currentSection ) {
			case 'feed':
				return <PodcastingFeedSettings />;
			case 'setup':
				return <PodcastingSetup />;
			default:
				return <PodcastingEpisodes />;
		}
	};

	const mainClassName =
		'site-settings podcasting-details' +
		( currentSection === 'episodes' ? ' podcasting-details--wide' : '' );

	return (
		<Main fullWidthLayout className={ mainClassName }>
			{ siteId && <QuerySiteSettings siteId={ siteId } /> }
			<DocumentHead title={ translate( 'Podcasting' ) } />
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
				title={ <JetpackTitle title={ translate( 'Podcasting' ) } /> }
			>
				<div className="podcasting-details__tabs-bar">
					<TabPanel
						key={ currentSection }
						className="podcasting-details__tabs"
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
				<div className="podcasting-details__tab-content">{ renderContent() }</div>
			</Page>
			<JetpackFooter />
		</Main>
	);
};

export default PodcastingDetails;
