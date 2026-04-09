import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import EmptyContent from 'calypso/components/empty-content';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';

/**
 * Props for the StreamError component.
 * @param onTryAgain - Callback to try again.
 * @param streamKey - The key of the stream.
 */
interface StreamErrorProps {
	onTryAgain?: () => void;
	streamKey: string;
	error: {
		message: string;
	};
}

export const StreamError = ( { onTryAgain, streamKey, error }: StreamErrorProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! error.message ) {
			return;
		}

		dispatch(
			errorNotice( translate( 'Stream error: %s', { args: error.message } ), { duration: 3000 } )
		);
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect( () => {
		recordTracksEvent( 'calypso_reader_stream_error', {
			stream_key: streamKey,
			path: window.location.pathname,
		} );
	}, [ streamKey ] );

	const handleTryAgain = () => {
		recordTracksEvent( 'calypso_reader_stream_error_try_again', {
			stream_key: streamKey,
			path: window.location.pathname,
		} );
		onTryAgain?.();
	};

	return (
		<EmptyContent
			className="stream__empty"
			title={ translate( 'Sorry, something went wrong.' ) }
			line={ translate( 'We couldn’t load your feed. Please try again.' ) }
			action={ translate( 'Try again' ) }
			actionCallback={ handleTryAgain }
		/>
	);
};
