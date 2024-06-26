import { useQuery } from '@tanstack/react-query';
import i18n from 'i18n-calypso';
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
	options: {
		label: string;
		value: string;
		help_text: string;
		additional_props: Record< string, boolean >;
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
					additionalProps: option.additional_props,
				};
			} ),
			subHeaderText: question.sub_header_text,
			type: QuestionType[ question.type.toUpperCase() as keyof typeof QuestionType ],
		};
	} );

const useSurveyStructureQuery = ( { surveyKey }: SurveyStructureQueryArgs ) => {
	// This follows exact logic as addLocaleQueryParam() middleware
	// which will add _locale to the query param and we want to cache
	// our surveys with the same locale value.
	const locale = i18n.getLocaleVariant() || i18n.getLocaleSlug();
	const queryKey = [ 'survey-structure', surveyKey, ...( locale ? [ locale ] : [] ) ];

	return useQuery( {
		queryKey,
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
