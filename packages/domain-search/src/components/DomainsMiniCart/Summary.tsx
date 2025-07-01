import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../DomainSearch/DomainSearch';

export const DomainsMiniCartSummary = ( {
	orientation = 'vertical',
}: {
	orientation?: 'horizontal' | 'vertical';
} ) => {
	const { _n } = useI18n();
	const { selectedDomains } = useDomainSearch();

	const domainCount = sprintf(
		// translators: %(domains)s is the number of domains selected.
		_n( '%(domains)s domain', '%(domains)s domains', selectedDomains.length ),
		{
			domains: selectedDomains.length,
		}
	);

	if ( orientation === 'vertical' ) {
		return (
			<VStack spacing={ 2 }>
				<Text>{ domainCount }</Text>
				<Text>$74</Text>
			</VStack>
		);
	}

	return (
		<HStack spacing={ 2 }>
			<Text>{ domainCount }</Text>
			<Text>$74</Text>
		</HStack>
	);
};
