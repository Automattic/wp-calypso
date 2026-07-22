import { __ } from '@wordpress/i18n';

// The legacy `start over` tool is gone — ask the user to resend instead.
export default function StartOverMessage() {
	return <p>{ __( 'To start over, please send your request again.', __i18n_text_domain__ ) }</p>;
}
