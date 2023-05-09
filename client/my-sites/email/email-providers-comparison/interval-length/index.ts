export enum IntervalLength {
	ANNUALLY = 'annually',
	MONTHLY = 'monthly',
}

export const castIntervalLength = ( stringValue: string ): IntervalLength | undefined => {
	const isStringValueInEnum = Object.values( IntervalLength ).some(
		( enumValue: string ) => enumValue === stringValue
	);

	if ( isStringValueInEnum ) {
		return stringValue as IntervalLength;
	}

	return undefined;
};
