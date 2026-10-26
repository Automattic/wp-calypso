import { AgentUI } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';
import './style.scss';

/**
 * Takes the composer's place while a held call waits for an answer, so Allow and
 * Decline are the only way forward. Keeps the notice, which says why a click on
 * them didn't send (e.g. no credits left).
 */
export function ActionApprovalFooter() {
	return (
		<AgentUI.Footer>
			<AgentUI.Notice />
			<p className="agents-manager-action-approval-footer">
				{ __( 'Allow or decline the request above to continue.', __i18n_text_domain__ ) }
			</p>
		</AgentUI.Footer>
	);
}
