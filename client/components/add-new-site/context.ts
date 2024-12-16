import { createContext } from 'react';
import type { AddNewSiteContextInterface } from './types';

export const AddNewSiteContext = createContext< AddNewSiteContextInterface >( {
	visibleModalType: '',
	setVisibleModalType: () => {
		return undefined;
	},
} );
