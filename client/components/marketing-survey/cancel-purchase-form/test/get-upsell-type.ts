import { PLAN_STUDENT } from '@automattic/calypso-products';
import { getUpsellType } from '../get-upsell-type';

describe( 'getUpsellType', () => {
	test( 'does not offer a monthly downgrade for Student plans', () => {
		expect(
			getUpsellType( 'tooExpensive', {
				productSlug: PLAN_STUDENT,
				canRefund: true,
				canDowngrade: true,
				canOfferFreeMonth: false,
			} )
		).toBe( '' );
	} );

	test( 'does not show an atomic upgrade upsell for Student plugin/theme reasons', () => {
		expect(
			getUpsellType( 'cannotInstallPlugins', {
				productSlug: PLAN_STUDENT,
				canRefund: true,
				canDowngrade: true,
				canOfferFreeMonth: false,
			} )
		).toBe( '' );

		expect(
			getUpsellType( 'cannotUploadThemes', {
				productSlug: PLAN_STUDENT,
				canRefund: true,
				canDowngrade: true,
				canOfferFreeMonth: false,
			} )
		).toBe( '' );
	} );
} );
