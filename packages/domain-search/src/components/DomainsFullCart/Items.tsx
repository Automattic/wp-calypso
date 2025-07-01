import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../DomainSearch/DomainSearch';

export const DomainsFullCartItems = () => {
	const { __ } = useI18n();
	const { selectedDomains } = useDomainSearch();

	return (
		<VStack spacing={ 3 }>
			{ selectedDomains.map( ( domain ) => (
				<Card key={ `${ domain.domain }.${ domain.tld }` }>
					<CardBody>
						<VStack spacing={ 2 }>
							<HStack spacing={ 4 }>
								<Text>
									{ domain.domain }.{ domain.tld }
								</Text>
								<Text>{ domain.price }</Text>
							</HStack>
							<Button variant="link">{ __( 'Remove' ) }</Button>
						</VStack>
					</CardBody>
				</Card>
			) ) }
		</VStack>
	);
};
