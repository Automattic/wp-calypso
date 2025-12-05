import config from '@automattic/calypso-config';
import { FoldableCard } from '@automattic/components';
import clsx from 'clsx';
import { fixMe, translate } from 'i18n-calypso';
import { useEffect } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import Banner from 'calypso/components/banner';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import { focusEditor } from 'calypso/reader/components/quick-post/utils';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import ReaderStream from 'calypso/reader/stream';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import { selectSidebarRecentSite } from 'calypso/state/reader-ui/sidebar/actions';
import Recent from '../recent';
import { useSiteSubscriptions } from './use-site-subscriptions';
import { useFollowingView } from './view-preference';
import ViewToggle from './view-toggle';
import './style.scss';

function FollowingStream( { ...props } ) {
	const { currentView } = useFollowingView();
	const { isLoading, hasNonSelfSubscriptions } = useSiteSubscriptions();
	const dispatch = useDispatch();
	const currentUser = useSelector( getCurrentUser );
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const hasSites = ( currentUser?.site_count ?? 0 ) > 0;

	const handleSurveyClick = () => {
		// Dismiss the banner permanently when the survey button is clicked
		dispatch( savePreference( 'dismissible-card-reader-creator-survey-2026-banner', true ) );
	};

	// Set the selected feed based on route param.
	useEffect( () => {
		// Note that 'null' specifically sets the all view.
		dispatch( selectSidebarRecentSite( { feedId: Number( props.feedId ) || null } ) );
	}, [ props.feedId, dispatch ] );

	if ( ! isLoading && ! hasNonSelfSubscriptions ) {
		return (
			<div className="following-stream--no-subscriptions">
				<NavigationHeader title={ translate( 'Recent' ) } />
				<p>
					{ translate(
						'{{strong}}Welcome!{{/strong}} Follow your favorite sites and their latest posts will appear here. Read, like, and comment in a distraction-free environment. Get started by selecting your interests below:',
						{
							components: {
								strong: <strong />,
							},
						}
					) }
				</p>
				<AsyncLoad require="calypso/reader/onboarding" forceShow />
			</div>
		);
	}

	return (
		<>
			{ currentView === 'recent' ? (
				<Recent viewToggle={ <ViewToggle /> } />
			) : (
				<ReaderStream { ...props } className="following">
					<BloganuaryHeader />
					<NavigationHeader
						title={ translate( 'Recent' ) }
						subtitle={ fixMe( {
							text: 'Latest from your subscriptions.',
							newCopy: translate( 'Latest from your subscriptions.' ),
							oldCopy: translate( 'Fresh content from blogs you follow.' ),
						} ) }
						className={ clsx( 'following-stream-header' ) }
					>
						<ViewToggle />
					</NavigationHeader>
					<Banner
						target="_blank"
						callToAction={ translate( 'Take the survey' ) }
						description={ translate(
							'Got a minute? Share feedback to help shape WordPress.com for creators and content consumption in 2026.'
						) }
						dismissPreferenceName="reader-creator-survey-2026-banner"
						horizontal
						href="https://automattic.survey.fm/creating-consuming-on-wordpress-com"
						title={ translate( 'Help shape WordPress.com for creators' ) }
						onClick={ handleSurveyClick }
						event="reader_creator_survey_2026"
						tracksImpressionName="calypso_reader_creator_survey_banner_view"
						tracksClickName="calypso_reader_creator_survey_banner_click"
						tracksDismissName="calypso_reader_creator_survey_banner_dismiss"
					/>
					{ config.isEnabled( 'reader/quick-post' ) && hasSites && (
						<FoldableCard
							header={ translate( 'Write a quick post' ) }
							clickableHeader
							compact
							expanded={ false }
							className="following-stream__quick-post-card"
							smooth
							contentExpandedStyle={ { maxHeight: '800px' } }
							useInert
							onOpen={ () => {
								focusEditor();
								recordReaderTracksEvent( 'calypso_reader_editor_card_opened' );
							} }
							onClose={ () => {
								recordReaderTracksEvent( 'calypso_reader_editor_card_closed' );
							} }
						>
							<AsyncLoad require="calypso/reader/components/quick-post" />
						</FoldableCard>
					) }
					<AsyncLoad require="calypso/reader/onboarding" />
				</ReaderStream>
			) }
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
}

export default SuggestionProvider( FollowingStream );
