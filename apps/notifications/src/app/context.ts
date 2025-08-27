import { createContext } from 'react';
import type { Client } from './types';

export const RestClientContext = createContext< Client | null >( null );
