import AsyncLoad from 'calypso/components/async-load';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import Stream from 'calypso/reader/stream';
import ReaderListFollowedSites from 'calypso/reader/stream/reader-list-followed-sites';
import FollowingIntro from './intro';
import './style.scss';

function FollowingStream( { ...props } ) {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<>
			<Stream
				className="following"
				streamSidebar={ <ReaderListFollowedSites path={ window.location.pathname } /> }
				{ ...props }
			>
				<FollowingIntro />
			</Stream>
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default SuggestionProvider( FollowingStream );
