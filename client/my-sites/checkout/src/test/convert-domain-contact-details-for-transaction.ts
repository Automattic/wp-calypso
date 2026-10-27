import { convertDomainContactDetailsForTransaction } from '../lib/translate-cart';

describe( 'convertDomainContactDetailsForTransaction', () => {
	it( 'converts contact details and TLD extra fields to snake_case', () => {
		expect(
			convertDomainContactDetailsForTransaction( {
				firstName: 'Ada',
				lastName: 'Lovelace',
				organization: 'Analytical Engines',
				email: 'ada@example.com',
				phone: '+1.5555555555',
				address1: '1 Main St',
				address2: 'Apt 2',
				city: 'Madrid',
				state: 'M',
				postalCode: '28001',
				countryCode: 'ES',
				fax: '+1.5555555556',
				vatId: 'ES123',
				extra: {
					ca: { lang: 'EN', legalType: 'CCT', ciraAgreementAccepted: true },
					uk: { registrantType: 'IND', registrationNumber: '123', tradingName: 'Ada Co' },
					fr: {
						registrantType: 'organization',
						registrantVatId: 'FR123',
						trademarkNumber: 'TM1',
						sirenSiret: '12345678900011',
					},
					in: { nexusDeclaration: true, nexusConnectionType: 'citizen' },
					es: {
						registrantEntityType: '1',
						registrantIdentificationNumber: 'X1234567L',
						adminIdentificationNumber: 'Y1234567L',
						redEsAgreementAccepted: true,
						redEsAgreementVersion: '1',
					},
				},
			} )
		).toEqual( {
			first_name: 'Ada',
			last_name: 'Lovelace',
			organization: 'Analytical Engines',
			email: 'ada@example.com',
			phone: '+1.5555555555',
			address_1: '1 Main St',
			address_2: 'Apt 2',
			city: 'Madrid',
			state: 'M',
			postal_code: '28001',
			country_code: 'ES',
			fax: '+1.5555555556',
			vat_id: 'ES123',
			extra: {
				ca: { lang: 'EN', legal_type: 'CCT', cira_agreement_accepted: true },
				uk: { registrant_type: 'IND', registration_number: '123', trading_name: 'Ada Co' },
				fr: {
					registrant_type: 'organization',
					registrant_vat_id: 'FR123',
					trademark_number: 'TM1',
					siren_siret: '12345678900011',
				},
				in: { nexus_declaration: true, nexus_connection_type: 'citizen' },
				es: {
					registrant_entity_type: '1',
					registrant_identification_number: 'X1234567L',
					admin_identification_number: 'Y1234567L',
					red_es_agreement_accepted: true,
					red_es_agreement_version: '1',
				},
			},
		} );
	} );

	it( 'keeps null TLD extra fields as null', () => {
		expect(
			convertDomainContactDetailsForTransaction( {
				firstName: 'Ada',
				extra: { ca: null, uk: null, fr: null, in: null, es: null },
			} ).extra
		).toEqual( { ca: null, uk: null, fr: null, in: null, es: null } );
	} );
} );
