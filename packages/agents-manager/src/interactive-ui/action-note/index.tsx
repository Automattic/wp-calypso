import { __, sprintf } from '@wordpress/i18n';
import './style.scss';

interface Props {
	/** The action's `userMessage`. */
	userMessage: string;
}

/**
 * Shows what the user did on a surface, from its action's `userMessage`, after a prefix of Agents
 * Manager's in an outlined bubble, so it never reads as a message they typed.
 */
export function InteractiveUiActionNote( { userMessage }: Props ) {
	return (
		<p className="agents-manager-interactive-ui-action-note">
			{ sprintf(
				/* translators: %s: what the user chose on a form or buttons in the chat, e.g. "Save the title" */
				__( 'You chose: %s', __i18n_text_domain__ ),
				userMessage
			) }
		</p>
	);
}
