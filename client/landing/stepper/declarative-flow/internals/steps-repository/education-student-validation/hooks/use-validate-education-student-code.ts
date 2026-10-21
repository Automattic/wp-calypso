import { DefaultError, useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type EducationStudentValidationResponse = {
	success?: boolean;
};

const validateEducationStudentCode = (
	code: string
): Promise< EducationStudentValidationResponse > => {
	return wpcom.req.post(
		{
			path: '/me/education-student-validation',
			apiNamespace: 'wpcom/v2',
		},
		{},
		{
			code,
		}
	);
};

export const useValidateEducationStudentCode = () => {
	return useMutation< EducationStudentValidationResponse, DefaultError, string >( {
		mutationKey: [ 'education-student-validation' ],
		mutationFn: validateEducationStudentCode,
	} );
};
