/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import moment from 'moment';
import React from 'react';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

/**
 * Internal dependencies
 */
import PurchaseItem from '../';
import i18n from 'i18n-calypso';

describe( 'PurchaseItem', () => {
	describe( 'a purchase that expired < 24 hours ago', () => {
		const purchase = {
			productSlug: 'business-bundle',
			expiryStatus: 'expired',
			expiryDate: moment().subtract( 10, 'hours' ).format(),
		};

		const store = createStore( () => {}, {} );
		const wrapper = shallow(
			<Provider store={ store }>
				<PurchaseItem purchase={ purchase } />
			</Provider>
		);

		test( 'should be described as "Expired today"', () => {
			expect( wrapper.html() ).toContain( 'Expired today' );
		} );

		test( 'should be described with a translated label', () => {
			const translation = 'Vandaag verlopen';
			i18n.addTranslations( { 'Expired today': [ translation ] } );
			expect( wrapper.html() ).toContain( translation );
		} );
	} );
} );
