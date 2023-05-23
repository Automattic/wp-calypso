import { createContext } from 'react';
import type { DashboardDataContextInterface } from './types';

const DashboardDataContext = createContext< DashboardDataContextInterface >( {
	verifiedContacts: { emails: [] },
} );

export default DashboardDataContext;
