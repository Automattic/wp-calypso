import { createContext } from 'react';
import type { DashboardDataContextInterface } from './types';

const DashboardDataContext = createContext< DashboardDataContextInterface >( {
	isLargeScreen: true,
} );

export default DashboardDataContext;
