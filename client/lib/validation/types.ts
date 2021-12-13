import type { ReactNode } from 'react';

export interface ValidationError {
	message: ReactNode;
}

export type validator< T > = ( data: T ) => null | ValidationError;
