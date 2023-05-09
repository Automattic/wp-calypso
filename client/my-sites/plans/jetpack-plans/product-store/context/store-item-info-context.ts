import { createContext, useContext } from 'react';
import { StoreItemInfo } from '../types';

const StoreItemInfoContext = createContext< StoreItemInfo >( {} as StoreItemInfo );

export default StoreItemInfoContext;

export const useStoreItemInfoContext = () => useContext( StoreItemInfoContext );
