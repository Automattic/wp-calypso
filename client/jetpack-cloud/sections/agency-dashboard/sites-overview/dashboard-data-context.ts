import { createContext } from 'react';
import type { DashboardDataContextInterface } from './types';

const DashboardDataContext = createContext< DashboardDataContextInterface >( {
	verifiedContacts: {
		emails: [],
		phoneNumbers: [],
		refetchIfFailed: () => {
			return undefined;
		},
	},
	geoData: {
		countryCode: '',
	},
} );

export default DashboardDataContext;
