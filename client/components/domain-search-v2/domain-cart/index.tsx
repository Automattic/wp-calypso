import { DomainsMiniCart, DomainsFullCart } from '@automattic/domain-search';
import {
	__experimentalVStack as VStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalView as View,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { FreeDomainForAYearPromo } from '../free-domain-for-a-year-promo';
import { ChooseDomainLater } from './choose-domain-later';
import { HundredYearPromo } from './hundred-year-promo';

import './style.scss';

interface Props {
	showFreeDomainPromo?: boolean;
	onSkip?: () => void;
}

export const DomainCartV2 = ( { showFreeDomainPromo = false, onSkip }: Props ) => {
	const hasDomainInCartEligibleFor100YearDomainUpgrade = false;

	return (
		<>
			<DomainsMiniCart className="domains-search-v2__mini-cart" />
			<DomainsFullCart className="domains-search-v2__full-cart">
				<VStack spacing={ 6 }>
					{ showFreeDomainPromo && <FreeDomainForAYearPromo textOnly /> }
					<DomainsFullCart.Items />
					{ onSkip && (
						<div>
							<ChooseDomainLater onSkip={ onSkip } />
						</div>
					) }
					{ hasDomainInCartEligibleFor100YearDomainUpgrade && (
						<View>
							<Spacer marginTop={ 4 }>
								<HundredYearPromo />
							</Spacer>
						</View>
					) }
				</VStack>
			</DomainsFullCart>
		</>
	);
};
