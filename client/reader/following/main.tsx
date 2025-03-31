import config from '@automattic/calypso-config';
import { FoldableCard } from '@automattic/components';
import clsx from 'clsx';
import { fixMe, translate } from 'i18n-calypso';
import { useEffect } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import withDimensions from 'calypso/lib/with-dimensions';
import QuickPost from 'calypso/reader/components/quick-post';
import { focusEditor } from 'calypso/reader/components/quick-post/utils';
import ReaderOnboarding from 'calypso/reader/onboarding';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import ReaderStream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
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
	const hasSites = ( currentUser?.site_count ?? 0 ) > 0;

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
				<ReaderOnboarding forceShow />
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
						className={ clsx( 'following-stream-header', {
							'reader-dual-column': props.width > WIDE_DISPLAY_CUTOFF,
						} ) }
					>
						<ViewToggle />
					</NavigationHeader>
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
							} }
						>
							<QuickPost />
						</FoldableCard>
					) }
					<ReaderOnboarding />
				</ReaderStream>
			) }
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
}

export default SuggestionProvider( withDimensions( FollowingStream ) );
