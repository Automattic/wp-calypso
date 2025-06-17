import { useMutation } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

interface FormulateQuestionData {
	selectedText: string;
	url: string;
}

/**
 * Formulates a question from selected text and URL.
 * This hook only calls the API and returns the result without adding messages to chat.
 * @returns useMutation return object.
 */
export const useFormulateQuestion = () => {
	return useMutation< { formatted_question: string }, Error, FormulateQuestionData >( {
		mutationFn: async ( {
			selectedText,
			url,
		}: FormulateQuestionData ): Promise< { formatted_question: string } > => {
			return canAccessWpcomApis()
				? await wpcomRequest( {
						method: 'POST',
						path: '/odie/formulate_question',
						apiNamespace: 'wpcom/v2',
						body: {
							selected_text: selectedText,
							url: url,
						},
				  } )
				: await apiFetch( {
						path: '/help-center/odie/formulate_question',
						method: 'POST',
						data: {
							selected_text: selectedText,
							url: url,
						},
				  } );
		},
	} );
};
