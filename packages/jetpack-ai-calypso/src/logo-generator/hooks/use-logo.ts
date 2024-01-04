/**
 * Types
 */
import { UseLogoProps } from '../../types';

const useLogo = ( { subject = 'World' }: UseLogoProps ) => {
	const message: string = `Hello ${ subject }`;

	return {
		message,
	};
};

export default useLogo;
