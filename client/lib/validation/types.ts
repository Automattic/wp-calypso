export interface ValidationError {
	message: string;
}

export type validator< T > = ( data: T ) => null | ValidationError;
