import config from '@automattic/calypso-config';
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
				{ ...props }
				className="following"
				streamHeader={
					config.isEnabled( 'reader/editor' ) && <AsyncLoad require="calypso/reader/post-editor" />
				}
				streamSidebar={ <ReaderListFollowedSites path={ window.location.pathname } /> }
			>
				<FollowingIntro />
			</Stream>
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
		</>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default SuggestionProvider( FollowingStream );
