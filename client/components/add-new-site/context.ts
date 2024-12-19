import { createContext } from 'react';
import type { AddNewSiteContextInterface } from './types';

const AddNewSiteContext = createContext< AddNewSiteContextInterface >( {
	visibleModalType: '',
	setVisibleModalType: () => {
		return undefined;
	},
} );

export default AddNewSiteContext;
