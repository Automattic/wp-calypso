import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import type { AtmosphereError } from '@automattic/api-core';

interface FeedListEmptyProps {
	error: AtmosphereError | null;
	onRetry: () => void;
	emptyTitle: string;
	emptyLine: string;
	emptyActionLabel?: string;
	emptyActionURL?: string;
}

export function FeedListEmpty( {
	error,
	onRetry,
	emptyTitle,
	emptyLine,
	emptyActionLabel,
	emptyActionURL,
}: FeedListEmptyProps ) {
	const translate = useTranslate();

	if ( ! error ) {
		return (
			<EmptyContent
				title={ emptyTitle }
				line={ emptyLine }
				action={ emptyActionLabel }
				actionURL={ emptyActionURL }
			/>
		);
	}

	switch ( error.kind ) {
		case 'auth_required':
			return (
				<EmptyContent
					title={ translate( 'Reconnect needed' ) }
					line={ translate( 'Your Bluesky connection needs to be reconnected. Coming soon.' ) }
				/>
			);
		case 'rate_limited': {
			const retryAfter = ( error as { retry_after?: number } ).retry_after;
			return (
				<EmptyContent
					title={ translate( 'Slow down' ) }
					line={
						retryAfter
							? translate( 'Bluesky is asking us to slow down. Try again in %(n)ds.', {
									args: { n: retryAfter },
							  } )
							: translate( 'Bluesky is asking us to slow down. Try again in a moment.' )
					}
					action={
						<Button variant="primary" onClick={ onRetry }>
							{ translate( 'Retry' ) }
						</Button>
					}
				/>
			);
		}
		case 'upstream_unavailable':
			return (
				<EmptyContent
					title={ translate( 'Bluesky unreachable' ) }
					line={ translate( 'Bluesky is temporarily unreachable. Try again in a moment.' ) }
					action={
						<Button variant="primary" onClick={ onRetry }>
							{ translate( 'Retry' ) }
						</Button>
					}
				/>
			);
		case 'not_found':
			return (
				<EmptyContent
					title={ translate( 'Connection not found' ) }
					line={ translate( 'This connection no longer exists.' ) }
					action={ translate( 'Back to ATmosphere' ) }
					actionURL="/reader/atmosphere"
				/>
			);
		default:
			return (
				<EmptyContent
					title={ translate( "Couldn't load timeline" ) }
					line={ translate( 'Something went wrong.' ) }
					action={
						<Button variant="primary" onClick={ onRetry }>
							{ translate( 'Retry' ) }
						</Button>
					}
				/>
			);
	}
}
