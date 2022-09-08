import { createContext, useContext } from 'react';
import { StoreItemInfo } from '../types';

const StoreItemInfoContext = createContext< StoreItemInfo >( {} as StoreItemInfo );

export default StoreItemInfoContext;

// A little hack here as we populate the default value in the component it is used.
export const useStoreItemInfoContext = () => useContext( StoreItemInfoContext );
