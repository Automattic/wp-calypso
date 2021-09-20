export interface ValidationError {
	message: ;
}

export type validator< T > = ( data: T ) => null | ValidationError;
