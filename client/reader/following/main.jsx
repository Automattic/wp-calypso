import ReaderPostEditor from 'calypso/reader/post-editor';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import Stream from 'calypso/reader/stream';
import FollowingIntro from './intro';
import '@automattic/isolated-block-editor/build-browser/core.css';
import './style.scss';

function FollowingStream( { ...props } ) {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Stream { ...props }>
			<ReaderPostEditor />
			<FollowingIntro />
		</Stream>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default SuggestionProvider( FollowingStream );
