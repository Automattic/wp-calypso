import IsoloatedEditor from '@automattic/isolated-block-editor';
import SuggestionProvider from 'calypso/reader/search-stream/suggestion-provider';
import Stream from 'calypso/reader/stream';
import FollowingIntro from './intro';
import './style.scss';

function FollowingStream( { ...props } ) {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Stream { ...props }>
			<IsoloatedEditor settings={ {} } onSaveContent={ () => {} } onSaveBlocks={ () => {} } />
			<FollowingIntro />
		</Stream>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default SuggestionProvider( FollowingStream );
