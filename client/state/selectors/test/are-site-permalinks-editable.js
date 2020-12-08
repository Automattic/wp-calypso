/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import areSitePermalinksEditable from 'calypso/state/selectors/are-site-permalinks-editable';

describe( 'areSitePermalinksEditable()', () => {
	test( 'should return false if site ID is not tracked', () => {
		const permalinksEditable = areSitePermalinksEditable(
			{
				sites: {
					items: {},
				},
			},
			77203199
		);

		expect( permalinksEditable ).to.be.false;
	} );

	test( 'should return true if the permalinks structure contains postname', () => {
		const permalinksEditable = areSitePermalinksEditable(
			{
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							options: {
								permalink_structure: '/%postname%/',
							},
						},
					},
				},
			},
			77203199
		);

		expect( permalinksEditable ).to.be.true;
	} );

	test( 'should return false if the permalinks structure does not contain postname', () => {
		const permalinksEditable = areSitePermalinksEditable(
			{
				sites: {
					items: {
						77203199: {
							ID: 77203199,
							options: {
								permalink_structure: '/%year%/%month%/%ID%',
							},
						},
					},
				},
			},
			77203199
		);

		expect( permalinksEditable ).to.be.false;
	} );
} );
