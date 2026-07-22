import { __ } from '@wordpress/i18n';

/**
 * Shown for the legacy `start over` tool message — the tool itself is gone,
 * so the user is asked to resend their request instead.
 */
export default function UnavailableToolMessage() {
	return <p>{ __( 'To start over, please send your request again.', __i18n_text_domain__ ) }</p>;
}
