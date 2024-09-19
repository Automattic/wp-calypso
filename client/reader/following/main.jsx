import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import withDimensions from 'calypso/lib/with-dimensions';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import Stream, { WIDE_DISPLAY_CUTOFF } from 'calypso/reader/stream';
import ReaderListFollowedSites from 'calypso/reader/stream/reader-list-followed-sites';
import FollowingIntro from './intro';
import './style.scss';

function FollowingStream( { ...props } ) {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<>
			<Stream
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
				/>
				<FollowingIntro />
			</Stream>
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default SuggestionProvider( withDimensions( FollowingStream ) );
