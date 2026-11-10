import { useI18n } from '@wordpress/react-i18n';
import { getAiDisclosureLine } from '../../utils/ai-disclosure-line';
import './style.scss';

export const AiDisclosureLine = ( { id, productName }: { id: string; productName?: string } ) => {
	const { __, hasTranslation } = useI18n();
	const { text, isEnglish } = getAiDisclosureLine( productName, { __, hasTranslation } );

	return (
		<p
			id={ id }
			className="odie-ai-disclosure-line"
			lang={ isEnglish ? 'en' : undefined }
			dir={ isEnglish ? 'ltr' : undefined }
		>
			{ text }
		</p>
	);
};
