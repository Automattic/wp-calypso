/**
 * Internal dependencies
 */
import {
	ManagedContactDetailsShape,
	updateManagedContactDetailsShape,
	flattenManagedContactDetailsShape,
} from '../types/wpcom-store-state';

/**
 *  External dependencies
 */
import { get } from 'lodash';

describe( 'updateManagedContactDetailsShape', function () {
	const testPropertyWithAccessor = ( merge, construct, update, data ) => ( accessor ) => {
		const value = get(
			updateManagedContactDetailsShape( merge, construct, update, data ),
			accessor
		);
		if ( get( update, accessor ) !== undefined && get( data, accessor ) !== undefined ) {
			it( 'update.A and data.A are both defined at ' + accessor, function () {
				expect( value ).toEqual( merge( get( update, accessor ), get( data, accessor ) ) );
			} );
		} else if ( get( update, accessor ) !== undefined && get( data, accessor ) === undefined ) {
			it( 'update.A is defined, data.A is undefined at ' + accessor, function () {
				expect( value ).toEqual( construct( get( update, accessor ) ) );
			} );
		} else if ( get( update, accessor ) === undefined && get( data, accessor ) !== undefined ) {
			it( 'data.A is defined, update.A is undefined at ' + accessor, function () {
				expect( value ).toEqual( get( data, accessor ) );
			} );
		} else if ( get( update, accessor ) === undefined && get( data, accessor ) === undefined ) {
			it( 'data.A and update.A are both undefined at ' + accessor, function () {
				expect( value ).toBeUndefined();
			} );
		} else {
			throw new Error( 'testPropertyWithAccessor: this case should be unreachable.' );
		}
		return true;
	};

	const accessors = [
		'firstName',
		'lastName',
		'organization',
		'email',
		'alternateEmail',
		'phone',
		'phoneNumberCountry',
		'address1',
		'address2',
		'city',
		'state',
		'postalCode',
		'countryCode',
		'fax',
		'vatId',
		'extra.ca.lang',
		'extra.ca.legalType',
		'extra.ca.ciraAgreementAccepted',
		'extra.uk.registrantType',
		'extra.uk.registrationNumber',
		'extra.uk.tradingName',
		'extra.fr.registrantType',
		'extra.fr.trademarkNumber',
		'extra.fr.sirenSirat',
	];

	const testProperty = ( merge, construct, update, data ) => {
		expect(
			accessors
				.map( testPropertyWithAccessor( merge, construct, update, data ) )
				.every( ( x ) => x )
		).toBeTruthy();
	};

	function getRandomBoolean( prob ): boolean {
		return Math.random() >= ( prob ?? 0.5 );
	}

	function getRandomInt( min, max ): number {
		return Math.floor( Math.random() * ( max - min ) ) + min;
	}

	// The property should be satisfied for _all_ data, so we check it for arbitrary data.
	const arbitraryData: ( gen: () => T ) => ManagedContactDetailsShape< T > = ( gen ) => {
		const data = {
			firstName: gen(),
			lastName: gen(),
			organization: gen(),
			email: gen(),
			alternateEmail: gen(),
			phone: gen(),
			phoneNumberCountry: gen(),
			address1: gen(),
			address2: gen(),
			city: gen(),
			state: gen(),
			postalCode: gen(),
			countryCode: gen(),
			fax: gen(),
			vatId: gen(),
			tldExtraFields: {},
		};

		if ( getRandomBoolean() ) {
			data.tldExtraFields.ca = {
				lang: gen(),
				legalType: gen(),
				ciraAgreementAccepted: gen(),
			};
		}
		if ( getRandomBoolean() ) {
			data.tldExtraFields.uk = {
				registrantType: gen(),
				registrationNumber: gen(),
				tradingName: gen(),
			};
		}
		if ( getRandomBoolean() ) {
			data.tldExtraFields.fr = {
				registrantType: gen(),
				trademarkNumber: gen(),
				sirenSirat: gen(),
			};
		}

		return data;
	};

	describe( 'with update:boolean and data:number', function () {
		// arbitrarily chosen function
		const m = getRandomInt( -10, 10 );
		const b = getRandomInt( -10, 10 );
		const merge: ( arg0: boolean, arg1: number ) => number = ( arg0, arg1 ) => {
			return arg0 ? m * arg1 : arg1 + b;
		};
		// arbitrarily chosen function
		const t = getRandomInt( -10, 10 );
		const f = getRandomInt( -10, 10 );
		const construct: ( arg0: boolean ) => number = ( arg0 ) => {
			return arg0 ? t : f;
		};
		const update: ManagedContactDetailsShape< boolean > = arbitraryData( () => getRandomBoolean() );
		const data: ManagedContactDetailsShape< number > = arbitraryData( () => getRandomInt( 0, 10 ) );
		testProperty( merge, construct, update, data );
	} );

	describe( 'with update:(boolean | undefined) and data:number', function () {
		// arbitrarily chosen function
		const m = getRandomInt( -10, 10 );
		const b = getRandomInt( -10, 10 );
		const merge: ( arg0: boolean | undefined, arg1: number ) => number = ( arg0, arg1 ) => {
			return arg0 ? m * arg1 : arg1 + b;
		};
		// arbitrarily chosen function
		const t = getRandomInt( -10, 10 );
		const f = getRandomInt( -10, 10 );
		const construct: ( arg0: boolean | undefined ) => number = ( arg0 ) => {
			return arg0 ? t : f;
		};
		const update: ManagedContactDetailsShape< boolean | undefined > = arbitraryData( () =>
			getRandomBoolean() ? undefined : getRandomBoolean()
		);
		const data: ManagedContactDetailsShape< number > = arbitraryData( () => getRandomInt( 0, 10 ) );
		testProperty( merge, construct, update, data );
	} );

	describe( 'with update:boolean and data:(number | undefined)', function () {
		// arbitrarily chosen function
		const m = getRandomInt( -10, 10 );
		const b = getRandomInt( -10, 10 );
		const merge: ( arg0: boolean, arg1: number | undefined ) => number = ( arg0, arg1 ) => {
			return arg0 ? m * arg1 : arg1 + b;
		};
		// arbitrarily chosen function
		const t = getRandomInt( -10, 10 );
		const f = getRandomInt( -10, 10 );
		const construct: ( arg0: boolean ) => number = ( arg0 ) => {
			return arg0 ? t : f;
		};
		const update: ManagedContactDetailsShape< boolean > = arbitraryData( () => getRandomBoolean() );
		const data: ManagedContactDetailsShape< number > = arbitraryData( () =>
			getRandomBoolean() ? undefined : getRandomInt( 0, 10 )
		);
		testProperty( merge, construct, update, data );
	} );

	describe( 'with update:(boolean | undefined) and data:(number | undefined)', function () {
		// arbitrarily chosen function
		const m = getRandomInt( -10, 10 );
		const b = getRandomInt( -10, 10 );
		const merge: ( arg0: boolean | undefined, arg1: number | undefined ) => number = (
			arg0,
			arg1
		) => {
			return arg0 ? m * arg1 : arg1 + b;
		};
		// arbitrarily chosen function
		const t = getRandomInt( -10, 10 );
		const f = getRandomInt( -10, 10 );
		const construct: ( arg0: boolean | undefined ) => number = ( arg0 ) => {
			return arg0 ? t : f;
		};
		const update: ManagedContactDetailsShape< boolean > = arbitraryData( () =>
			getRandomBoolean() ? undefined : getRandomBoolean()
		);
		const data: ManagedContactDetailsShape< number > = arbitraryData( () =>
			getRandomBoolean() ? undefined : getRandomInt( 0, 10 )
		);
		testProperty( merge, construct, update, data );
	} );
} );

describe( 'flattenManagedContactDetailsShape', function () {
	it( 'with no extra fields', () => {
		expect(
			flattenManagedContactDetailsShape( ( x ) => x.length, {
				firstName: 'firstName',
				lastName: 'lastName',
				organization: 'organization',
				email: 'email',
				alternateEmail: 'alternateEmail',
				phone: 'phone',
				phoneNumberCountry: 'phoneNumberCountry',
				address1: 'address1',
				address2: 'address2',
				city: 'city',
				state: 'state',
				postalCode: 'postalCode',
				countryCode: 'countryCode',
				fax: 'fax',
				vatId: 'vatId',
				tldExtraFields: {},
			} )
		).toEqual( [ 9, 8, 12, 5, 14, 5, 18, 8, 8, 4, 5, 10, 11, 3, 5 ] );
	} );

	it( 'with ca fields', () => {
		expect(
			flattenManagedContactDetailsShape( ( x ) => x.length, {
				firstName: 'firstName',
				lastName: 'lastName',
				organization: 'organization',
				email: 'email',
				alternateEmail: 'alternateEmail',
				phone: 'phone',
				phoneNumberCountry: 'phoneNumberCountry',
				address1: 'address1',
				address2: 'address2',
				city: 'city',
				state: 'state',
				postalCode: 'postalCode',
				countryCode: 'countryCode',
				fax: 'fax',
				vatId: 'vatId',
				tldExtraFields: {
					ca: {
						lang: 'lang',
						legalType: 'legalType',
						ciraAgreementAccepted: 'ciraAgreementAccepted',
					},
				},
			} )
		).toEqual( [ 9, 8, 12, 5, 14, 5, 18, 8, 8, 4, 5, 10, 11, 3, 5, 4, 9, 21 ] );
	} );

	it( 'with uk fields', () => {
		expect(
			flattenManagedContactDetailsShape( ( x ) => x.length, {
				firstName: 'firstName',
				lastName: 'lastName',
				organization: 'organization',
				email: 'email',
				alternateEmail: 'alternateEmail',
				phone: 'phone',
				phoneNumberCountry: 'phoneNumberCountry',
				address1: 'address1',
				address2: 'address2',
				city: 'city',
				state: 'state',
				postalCode: 'postalCode',
				countryCode: 'countryCode',
				fax: 'fax',
				vatId: 'vatId',
				tldExtraFields: {
					uk: {
						registrantType: 'registrantType',
						registrationNumber: 'registrationNumber',
						tradingName: 'tradingName',
					},
				},
			} )
		).toEqual( [ 9, 8, 12, 5, 14, 5, 18, 8, 8, 4, 5, 10, 11, 3, 5, 14, 18, 11 ] );
	} );

	it( 'with fr fields', () => {
		expect(
			flattenManagedContactDetailsShape( ( x ) => x.length, {
				firstName: 'firstName',
				lastName: 'lastName',
				organization: 'organization',
				email: 'email',
				alternateEmail: 'alternateEmail',
				phone: 'phone',
				phoneNumberCountry: 'phoneNumberCountry',
				address1: 'address1',
				address2: 'address2',
				city: 'city',
				state: 'state',
				postalCode: 'postalCode',
				countryCode: 'countryCode',
				fax: 'fax',
				vatId: 'vatId',
				tldExtraFields: {
					fr: {
						registrantType: 'registrantType',
						trademarkNumber: 'trademarkNumber',
						sirenSirat: 'sirenSirat',
					},
				},
			} )
		).toEqual( [ 9, 8, 12, 5, 14, 5, 18, 8, 8, 4, 5, 10, 11, 3, 5, 14, 15, 10 ] );
	} );

	it( 'with all fields', () => {
		expect(
			flattenManagedContactDetailsShape( ( x ) => x.length, {
				firstName: 'firstName',
				lastName: 'lastName',
				organization: 'organization',
				email: 'email',
				alternateEmail: 'alternateEmail',
				phone: 'phone',
				phoneNumberCountry: 'phoneNumberCountry',
				address1: 'address1',
				address2: 'address2',
				city: 'city',
				state: 'state',
				postalCode: 'postalCode',
				countryCode: 'countryCode',
				fax: 'fax',
				vatId: 'vatId',
				tldExtraFields: {
					ca: {
						lang: 'lang',
						legalType: 'legalType',
						ciraAgreementAccepted: 'ciraAgreementAccepted',
					},
					uk: {
						registrantType: 'registrantType',
						registrationNumber: 'registrationNumber',
						tradingName: 'tradingName',
					},
					fr: {
						registrantType: 'registrantType',
						trademarkNumber: 'trademarkNumber',
						sirenSirat: 'sirenSirat',
					},
				},
			} )
		).toEqual( [
			9,
			8,
			12,
			5,
			14,
			5,
			18,
			8,
			8,
			4,
			5,
			10,
			11,
			3,
			5,
			4,
			9,
			21,
			14,
			18,
			11,
			14,
			15,
			10,
		] );
	} );
} );
