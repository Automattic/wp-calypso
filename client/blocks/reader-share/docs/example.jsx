import { posts } from 'calypso/blocks/reader-post-card/docs/fixtures';
import ReaderShare from 'calypso/blocks/reader-share';

const ReaderShareExample = () => (
	<div style={ { width: '100px' } }>
		<ReaderShare post={ posts[ 0 ] } />
	</div>
);

ReaderShareExample.displayName = 'ReaderShare';

export default ReaderShareExample;
