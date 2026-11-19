import { isEnabled } from '@automattic/calypso-config';

/** Off until Spacefast launches; flip `a4a-spacefast-promo` in config to turn the promos on. */
export function isSpacefastPromoEnabled() {
	return isEnabled( 'a4a-spacefast-promo' );
}
