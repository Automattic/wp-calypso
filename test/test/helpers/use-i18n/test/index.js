/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { translate, i18nState } from 'lib/mixins/i18n';
import useI18n from '../';

describe( '#useI18n()', () => {
	before( () => {
		i18nState.jed = undefined;
		i18nState.locale = undefined;
		i18nState.localeSlug = undefined;
	} );

	context( 'without usage', () => {
		it( 'should throw if not used', () => {
			expect( () => translate( 'Hello' ) ).to.throw( Error );
		} );
	} );

	context( 'with usage', () => {
		useI18n();

		it( 'should initialize i18n', () => {
			expect( () => translate( 'Hello' ) ).not.to.throw( Error );
		} );
	} );
} );
