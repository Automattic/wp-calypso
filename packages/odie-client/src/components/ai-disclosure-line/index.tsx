import { useI18n } from '@wordpress/react-i18n';
import './style.scss';

export const AiDisclosureLine = ( { id, line }: { id: string; line?: string } ) => {
	const { __ } = useI18n();

	return (
		<p id={ id } className="odie-ai-disclosure-line">
			{ line || __( 'You’re chatting with AI.', __i18n_text_domain__ ) }
		</p>
	);
};
