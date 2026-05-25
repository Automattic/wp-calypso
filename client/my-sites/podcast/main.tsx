import page from '@automattic/calypso-router';
import { Page } from '@wordpress/admin-ui';
import { Tabs } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
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
import Settings from './components/settings';
import Welcome from './components/welcome';
import useAccessGate from './hooks/use-access-gate';

import './style.scss';

const VALID_SECTIONS = [ 'episodes', 'distribution', 'settings' ] as const;
type PodcastSection = ( typeof VALID_SECTIONS )[ number ];

type PodcastMainProps = {
	section?: string;
};

const isValidSection = ( s: string | undefined ): s is PodcastSection =>
	!! s && ( VALID_SECTIONS as readonly string[] ).includes( s );

const PodcastMain = ( { section }: PodcastMainProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const accessGate = useAccessGate();
	// If podcasting_category_id is set, trust it (0 = user disabled). Only
	// when the setting is missing do we fall back to a "Podcast" category
	// heuristic so sites with episodes already flowing through that term
	// land on Episodes by default.
	const isSetUp = useSelector( ( state ) => {
		if ( ! siteId ) {
			return false;
		}
		const categoryId = getPodcastingCategoryId( state, siteId );
		if ( categoryId !== null ) {
			return Number( categoryId ) > 0;
		}
		const terms = getTerms( state, siteId, 'category' );
		return Array.isArray( terms )
			? terms.some( ( term ) => term?.name?.toLowerCase?.() === 'podcast' )
			: false;
	} );
	// True once we have a definitive answer for `isSetUp` — either the
	// setting has loaded (any value, including 0), or the terms list has
	// loaded. Used to suppress a welcome → tabs flash on the bare
	// /settings/podcast/[site] URL while data is still in flight.
	const isSetupResolved = useSelector( ( state ) => {
		if ( ! siteId ) {
			return true;
		}
		if ( getPodcastingCategoryId( state, siteId ) !== null ) {
			return true;
		}
		return Array.isArray( getTerms( state, siteId, 'category' ) );
	} );
	const pathSuffix = siteSlug ? '/' + siteSlug : '';

	// Tabs only show when podcasting is actually set up. A deep link to
	// /settings/podcast/episodes/[site] on a non-set-up site bounces back to the
	// welcome via the URL-sync effect below.
	const showTabs = isSetUp;

	// Track the active tab in local state so clicking a tab swaps the panel
	// without re-running the page.js controller (which would re-mount the
	// entire page chrome). The URL is kept in sync via history.pushState; the
	// browser back/forward still works because page.js owns popstate.
	const [ tabSection, setTabSection ] = useState< PodcastSection >(
		isValidSection( section ) ? section : 'episodes'
	);
	useEffect( () => {
		if ( isValidSection( section ) ) {
			setTabSection( section );
		}
	}, [ section ] );

	// Keep the URL in sync with the current view: tabs live at
	// /settings/podcast/<section>/[site], welcome at the bare /settings/podcast/[site]. A
	// disabled podcast on episodes/distribution gets bounced back to welcome,
	// but /settings/podcast/settings stays accessible so the user can flip podcasting on.
	useEffect( () => {
		if ( ! isSetupResolved ) {
			return;
		}
		const path = window.location.pathname;
		const isSectionUrl = /^\/settings\/podcast\/(episodes|distribution|settings)(\/|$)/.test(
			path
		);
		const isContentSectionUrl = /^\/settings\/podcast\/(episodes|distribution)(\/|$)/.test( path );
		if ( showTabs && ! isSectionUrl ) {
			window.history.replaceState( null, '', '/settings/podcast/episodes' + pathSuffix );
		} else if ( ! showTabs && isContentSectionUrl ) {
			window.history.replaceState( null, '', '/settings/podcast' + pathSuffix );
		}
	}, [ showTabs, isSetupResolved, pathSuffix ] );

	// Detect a true→false transition on isSetUp (the user just disabled
	// podcasting from Settings) and bounce them to Welcome via page.show so
	// the controller re-runs with no `section` prop.
	const prevIsSetUp = useRef( isSetUp );
	useEffect( () => {
		if ( isSetupResolved && prevIsSetUp.current && ! isSetUp ) {
			page.show( '/settings/podcast' + pathSuffix );
		}
		prevIsSetUp.current = isSetUp;
	}, [ isSetUp, isSetupResolved, pathSuffix ] );

	const tabs = [
		{
			name: 'episodes' as const,
			title: translate( 'Episodes' ) as string,
			path: '/settings/podcast/episodes' + pathSuffix,
		},
		{
			name: 'distribution' as const,
			title: translate( 'Distribution' ) as string,
			path: '/settings/podcast/distribution' + pathSuffix,
		},
		{
			name: 'settings' as const,
			title: translate( 'Settings' ) as string,
			path: '/settings/podcast/settings' + pathSuffix,
		},
	];

	const handleSelect = ( tabId: string ) => {
		if ( ! isValidSection( tabId ) ) {
			return;
		}
		const target = tabs.find( ( t ) => t.name === tabId );
		if ( ! target ) {
			return;
		}
		setTabSection( tabId );
		if ( window.location.pathname !== target.path ) {
			window.history.pushState( null, '', target.path );
		}
	};

	let pageContent;
	if ( accessGate ) {
		pageContent = accessGate;
	} else if ( ! isSetupResolved ) {
		// Render nothing until we know whether podcasting is set up — prevents
		// a Welcome flash before terms/site-settings resolve and we switch to
		// tabs.
		pageContent = null;
	} else if ( showTabs ) {
		pageContent = (
			<Tabs.Root
				value={ tabSection }
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
						<Distribution onGoToSettings={ () => handleSelect( 'settings' ) } />
					</div>
				</Tabs.Panel>
				<Tabs.Panel value="settings">
					<div className="podcast__tab-content">
						<Settings />
					</div>
				</Tabs.Panel>
			</Tabs.Root>
		);
	} else if ( section === 'settings' ) {
		// Pre-setup users land here from Welcome's "Enable podcasting" CTA;
		// render Settings on its own so they can pick a category.
		pageContent = (
			<div className="podcast__tab-content">
				<Settings />
			</div>
		);
	} else {
		pageContent = (
			<div className="podcast__tab-content">
				<Welcome />
			</div>
		);
	}

	return (
		<Main fullWidthLayout className="podcast">
			{ siteId && <QuerySiteSettings siteId={ siteId } /> }
			{ siteId && <QueryTerms siteId={ siteId } taxonomy="category" /> }
			<DocumentHead title={ translate( 'Podcast' ) } />
			<Page
				hasPadding
				showSidebarToggle={ false }
				title={ <JetpackTitle title={ translate( 'Podcast' ) } /> }
				subTitle={ translate(
					'Publish a podcast and reach your fans, anywhere they listen. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
					{
						components: {
							learnMoreLink: <InlineSupportLink supportContext="podcasting" showIcon={ false } />,
						},
					}
				) }
			>
				{ pageContent }
			</Page>
			<JetpackFooter />
		</Main>
	);
};

export default PodcastMain;
