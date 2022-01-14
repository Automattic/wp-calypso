import type { ReactChild } from 'react';

export interface ValidationError {
	message: ReactChild;
}

export type validator< T > = ( data: T ) => null | ValidationError;
