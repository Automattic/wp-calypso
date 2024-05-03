import { useQuery } from '@tanstack/react-query';
import { Question, QuestionType } from 'calypso/components/survey-container/types';
import wpcom from 'calypso/lib/wp';

type SurveyStructureQueryArgs = {
	surveyKey: string;
};

type SurveyStructureResponse = {
	header_text: string;
	key: string;
	sub_header_text: string;
	type: string;
	required?: boolean;
	options: {
		label: string;
		value: string;
		help_text: string;
	}[];
}[];

const mapSurveyStructureResponse = ( response: SurveyStructureResponse ): Question[] =>
	response.map( ( question ) => {
		return {
			headerText: question.header_text,
			key: question.key,
			options: question.options.map( ( option ) => {
				return {
					label: option.label,
					value: option.value,
					helpText: option.help_text,
				};
			} ),
			subHeaderText: question.sub_header_text,
			type: QuestionType[ question.type.toUpperCase() as keyof typeof QuestionType ],
			required: !! question.required,
		};
	} );

const useSurveyStructureQuery = ( { surveyKey }: SurveyStructureQueryArgs ) => {
	return useQuery( {
		queryKey: [ 'survey-structure', surveyKey ],
		queryFn: () => {
			return wpcom.req.get( {
				path: `/segmentation-survey/${ surveyKey }`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		select: mapSurveyStructureResponse,
	} );
};

export default useSurveyStructureQuery;
