import { __ } from '@wordpress/i18n';
import './style.scss';

interface Props {
	onRetry: () => void;
}

/**
 * Inline notice beneath a user turn that never reached the server (reconciled as
 * `failed` on mount). Retry dispatches a fresh send rather than repopulating the
 * composer, so the merchant isn't left with a stale draft to resend by hand.
 *
 * Plain `<button>`, not `@wordpress/components`: importing that package here
 * pulls the whole component index into `orchestrator-chat`'s module graph and
 * breaks its test suite on `@wordpress/data`.
 */
export default function RetryFailedMessage( { onRetry }: Props ) {
	return (
		<div className="agents-manager__retry-failed-message">
			<p className="agents-manager__retry-failed-message-text">
				{ __( "This message didn't reach the assistant.", __i18n_text_domain__ ) }
			</p>
			<button
				type="button"
				className="agents-manager__retry-failed-message-button"
				onClick={ onRetry }
			>
				{ __( 'Retry', __i18n_text_domain__ ) }
			</button>
		</div>
	);
}
