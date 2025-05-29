import { createContext, useContext } from 'react';
import type { TabsContextProps } from './types';

export const TabsContext = createContext< TabsContextProps >( undefined );

export const useTabsContext = () => useContext( TabsContext );
