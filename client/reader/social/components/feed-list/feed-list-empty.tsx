import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import EmptyContent from 'calypso/components/empty-content';
import type { SocialError } from '../../types';

interface FeedListEmptyProps {
	error: SocialError | null;
	onRetry: () => void;
	emptyTitle: string;
	emptyLine: string;
	emptyActionLabel?: string;
	emptyActionURL?: string;
	protocolLabel: string;
	protocolHomeURL: string;
	protocolHomeLabel: string;
	// Protocols without a working reconnect flow (Bluesky, Fediverse) pass
	// this to replace the default "Reconnect needed" + protocol-home link
	// with generic copy + a Retry button.
	authRequiredCopy?: { title: string; line: string };
}

export function FeedListEmpty( {
	error,
	onRetry,
	emptyTitle,
	emptyLine,
	emptyActionLabel,
	emptyActionURL,
	protocolLabel,
	protocolHomeURL,
	protocolHomeLabel,
	authRequiredCopy,
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
			if ( authRequiredCopy ) {
				return (
					<EmptyContent
						title={ authRequiredCopy.title }
						line={ authRequiredCopy.line }
						action={
							<Button variant="primary" onClick={ onRetry }>
								{ translate( 'Retry' ) }
							</Button>
						}
					/>
				);
			}
			return (
				<EmptyContent
					title={ translate( 'Reconnect needed' ) }
					line={ translate( 'Your %(protocol)s connection needs to be reconnected.', {
						args: { protocol: protocolLabel },
					} ) }
					action={ protocolHomeLabel }
					actionURL={ protocolHomeURL }
				/>
			);
		case 'rate_limited': {
			const retryAfter = error.retry_after;
			return (
				<EmptyContent
					title={ translate( 'Slow down' ) }
					line={
						retryAfter
							? translate(
									'%(protocol)s is asking us to slow down. Try again in %(n)d second.',
									'%(protocol)s is asking us to slow down. Try again in %(n)d seconds.',
									{
										count: retryAfter,
										args: { protocol: protocolLabel, n: retryAfter },
									}
							  )
							: translate( '%(protocol)s is asking us to slow down. Try again in a moment.', {
									args: { protocol: protocolLabel },
							  } )
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
					title={ translate( '%(protocol)s unreachable', {
						args: { protocol: protocolLabel },
					} ) }
					line={ translate( '%(protocol)s is temporarily unreachable. Try again in a moment.', {
						args: { protocol: protocolLabel },
					} ) }
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
					action={ protocolHomeLabel }
					actionURL={ protocolHomeURL }
				/>
			);
		default:
			return (
				<EmptyContent
					title={ translate( "Couldn't load timeline" ) }
					// Prefer the backend-supplied message when the projector
					// passed one through (e.g. bad_request validation copy).
					// Falls back to the generic line for protocol-side errors
					// that don't carry actionable detail.
					line={ error.message ?? translate( 'Something went wrong.' ) }
					action={
						<Button variant="primary" onClick={ onRetry }>
							{ translate( 'Retry' ) }
						</Button>
					}
				/>
			);
	}
}
