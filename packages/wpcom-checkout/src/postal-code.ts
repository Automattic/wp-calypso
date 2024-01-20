type PostalCodeFormatter = ( postalCode: string, delimiter: string ) => string;

type PostalCodeDataWithFormatter = {
	length: number[];
	delimiter: string;
	formatter: PostalCodeFormatter;
};

type PostalCodeDataWithPartLength = {
	length: number[];
	delimiter: string;
	partLength: number;
};

function defaultFormatter( postalCode: string, delimiter: string, partLength: number ): string {
	return postalCode.substring( 0, partLength ) + delimiter + postalCode.substring( partLength );
}

const twoPartPostalCodes: Record<
	string,
	PostalCodeDataWithPartLength | PostalCodeDataWithFormatter
> = {
	BR: {
		length: [ 8 ],
		delimiter: '-',
		partLength: 5,
	},
	CA: {
		length: [ 6 ],
		delimiter: ' ',
		partLength: 3,
	},
	GB: {
		length: [ 5, 6, 7 ],
		delimiter: ' ',
		formatter: ( postalCodeInput: string, delimiter: string ) => {
			return (
				postalCodeInput.substring( 0, postalCodeInput.length - 3 ) +
				delimiter +
				postalCodeInput.substring( postalCodeInput.length - 3 )
			);
		},
	},
	IE: {
		length: [ 7 ],
		delimiter: ' ',
		partLength: 3,
	},
	JP: {
		length: [ 7 ],
		delimiter: '-',
		partLength: 3,
	},
	KY: {
		length: [ 7 ],
		delimiter: '-',
		partLength: 3,
	},
	NL: {
		length: [ 6 ],
		delimiter: ' ',
		partLength: 4,
	},
	PL: {
		length: [ 5 ],
		delimiter: '-',
		partLength: 2,
	},
	PT: {
		length: [ 7 ],
		delimiter: '-',
		partLength: 4,
	},
	SE: {
		length: [ 5 ],
		delimiter: ' ',
		partLength: 3,
	},
	US: {
		length: [ 9 ],
		delimiter: '-',
		partLength: 5,
	},
};

function isCountryCodeDataWithFormatter(
	countryCodeData: unknown
): countryCodeData is PostalCodeDataWithFormatter {
	return !! ( countryCodeData as PostalCodeDataWithFormatter ).formatter;
}

/**
 * Tries to convert given postal code based on the country code into a standardised format
 * @param {string} postalCode user inputted postal code
 * @param {string|null|undefined} countryCode user selected country
 * @returns {string} formatted postal code
 */
export function tryToGuessPostalCodeFormat(
	postalCode: string,
	countryCode?: string | null | undefined
): string {
	if ( ! countryCode ) {
		return postalCode;
	}
	const countryCodeData = twoPartPostalCodes[ countryCode ];
	if ( ! countryCodeData ) {
		return postalCode;
	}

	const postalCodeWithoutDelimiters = postalCode.replace( /[\s-]/g, '' );

	if ( countryCodeData.length.includes( postalCodeWithoutDelimiters.length ) ) {
		if ( isCountryCodeDataWithFormatter( countryCodeData ) ) {
			return countryCodeData.formatter( postalCodeWithoutDelimiters, countryCodeData.delimiter );
		}

		return defaultFormatter(
			postalCodeWithoutDelimiters,
			countryCodeData.delimiter,
			countryCodeData.partLength
		);
	}

	return postalCode;
}

const postalCodePatterns: Record< string, RegExp > = {
	US: /^\d{5}$/,
};

export function isValidPostalCode( postalCode: string, countryCode = 'US' ): boolean {
	// TODO - every other country
	if ( ! postalCode ) {
		return false;
	}

	const pattern = postalCodePatterns[ countryCode ];
	if ( ! pattern ) {
		return true;
	}

	return pattern.test( postalCode );
}
