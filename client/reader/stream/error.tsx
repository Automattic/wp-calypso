import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import EmptyContent from 'calypso/components/empty-content';

/**
 * Props for the StreamError component.
 * @param onTryAgain - Callback to try again.
 * @param streamKey - The key of the stream.
 */
interface StreamErrorProps {
	onTryAgain?: () => void;
	streamKey: string;
}

export const StreamError = ( { onTryAgain, streamKey }: StreamErrorProps ) => {
	const translate = useTranslate();

	useEffect( () => {
		recordTracksEvent( 'reader_stream_error', {
			stream_key: streamKey,
			path: window.location.pathname,
		} );
	}, [ streamKey ] );

	const handleTryAgain = () => {
		recordTracksEvent( 'reader_stream_error_try_again', {
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
