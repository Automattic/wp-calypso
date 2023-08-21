import { createContext } from 'react';
import { FormStatus, FormStatusContextInterface } from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const defaultFormStatusContext: FormStatusContextInterface = {
	formStatus: FormStatus.LOADING,
	setFormStatus: noop,
};

export const FormStatusContext = createContext( defaultFormStatusContext );
