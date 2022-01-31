import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestThumbnail } from 'calypso/state/reader/thumbnails/actions';
import { getThumbnailForIframe } from 'calypso/state/reader/thumbnails/selectors';

const request = ( embedUrl ) => ( dispatch, getState ) => {
	if ( embedUrl && ! getThumbnailForIframe( getState(), embedUrl ) ) {
		dispatch( requestThumbnail( embedUrl ) );
	}
};

export default function QueryReaderThumbnails( { embedUrl } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( embedUrl ) );
	}, [ dispatch, embedUrl ] );

	return null;
}

QueryReaderThumbnails.propTypes = { embedUrl: PropTypes.string.isRequired };
