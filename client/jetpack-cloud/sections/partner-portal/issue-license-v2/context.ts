import { createContext } from 'react';
import type { IssueLicenseContext as IssueLicenseContextInterface } from './types';

const IssueLicenseContext = createContext< IssueLicenseContextInterface >( {
	selectedLicenses: [],
	setSelectedLicenses: () => {
		return undefined;
	},
} );

export default IssueLicenseContext;
