import { createContext } from 'react';
import { FormStatus, FormStatusManager } from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

const defaultFormStatusContext: FormStatusManager = {
	formStatus: FormStatus.LOADING,
	setFormStatus: noop,
};

export const FormStatusContext = createContext( defaultFormStatusContext );
