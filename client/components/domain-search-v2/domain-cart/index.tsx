import { DomainsMiniCart, DomainsFullCart } from '@automattic/domain-search';
import {
	__experimentalVStack as VStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalView as View,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { FreeDomainForAYearPromo } from './free-domain-for-a-year-promo';
import { HundredYearPromo } from './hundred-year-promo';

import './style.scss';

export const DomainCartV2 = () => (
	<>
		<DomainsMiniCart className="domains-search-v2__mini-cart" />
		<DomainsFullCart className="domains-search-v2__full-cart">
			<VStack spacing={ 6 }>
				<FreeDomainForAYearPromo />
				<DomainsFullCart.Items />
				<View>
					<Spacer marginTop={ 4 }>
						<HundredYearPromo />
					</Spacer>
				</View>
			</VStack>
		</DomainsFullCart>
	</>
);
