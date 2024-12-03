import config from '@automattic/calypso-config';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import withDimensions from 'calypso/lib/with-dimensions';
import ReaderOnboarding from 'calypso/reader/onboarding';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import ReaderStream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import ReaderListFollowedSites from 'calypso/reader/stream/reader-list-followed-sites';
import Recent from '../recent';
import { useFollowingView } from './view-preference';
import ViewToggle from './view-toggle';
import './style.scss';

function FollowingStream( { ...props } ) {
	const { currentView } = useFollowingView();

	const viewToggle = config.isEnabled( 'reader/recent-feed-overhaul' ) ? <ViewToggle /> : null;

	return (
		<>
			{ currentView === 'recent' && config.isEnabled( 'reader/recent-feed-overhaul' ) ? (
				<Recent viewToggle={ viewToggle } />
			) : (
				<ReaderStream
					{ ...props }
					className="following"
					streamSidebar={ () => <ReaderListFollowedSites path={ window.location.pathname } /> }
				>
					<BloganuaryHeader />
					<NavigationHeader
						title={ translate( 'Recent' ) }
						subtitle={ translate( "Stay current with the blogs you've subscribed to." ) }
						className={ clsx( 'following-stream-header', {
							'reader-dual-column': props.width > WIDE_DISPLAY_CUTOFF,
						} ) }
					>
						{ viewToggle }
					</NavigationHeader>
					<ReaderOnboarding />
				</ReaderStream>
			) }
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
}

export default SuggestionProvider( withDimensions( FollowingStream ) );
