import { trackScrollPage } from 'calypso/reader/controller-helper';
import Stream from 'calypso/reader/stream';

const ReaderCard = () => {
	return (
		<Stream
			streamKey="discover:recommended--dailyprompt"
			trackScrollPage={ trackScrollPage.bind( null ) }
		/>
	);
};

export default ReaderCard;
