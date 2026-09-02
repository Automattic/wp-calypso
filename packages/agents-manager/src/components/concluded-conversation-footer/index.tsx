import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import './style.scss';

export default function ConcludedConversationFooter() {
	const navigate = useNavigate();
	return (
		<div className="concluded-conversation-footer">
			<Button variant="primary" onClick={ () => navigate( '/' ) }>
				{ __( 'Still need help? Start a new chat', __i18n_text_domain__ ) }
			</Button>
		</div>
	);
}
