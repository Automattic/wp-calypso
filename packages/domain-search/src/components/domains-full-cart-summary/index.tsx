import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../DomainSearch/DomainSearch';

export const DomainsFullCartSummary = () => {
	const { _n } = useI18n();
	const { cart } = useDomainSearch();

	const domainCount = sprintf(
		// translators: %(domains)s is the number of domains selected.
		_n( '%(domains)s domain', '%(domains)s domains', cart.items.length ),
		{
			domains: cart.items.length,
		}
	);

	return (
		<HStack alignment="edge" spacing={ 2 }>
			<Text size="small">{ domainCount }</Text>
			<Text size="medium" weight={ 500 }>
				{ cart.total }
			</Text>
		</HStack>
	);
};
