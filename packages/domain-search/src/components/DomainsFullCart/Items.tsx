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
	const { cart } = useDomainSearch();

	return (
		<VStack spacing={ 3 }>
			{ cart.items.map( ( domain ) => (
				<Card key={ `${ domain.domain }.${ domain.tld }` }>
					<CardBody>
						<VStack spacing={ 2 }>
							<HStack spacing={ 4 }>
								<Text>
									{ domain.domain }.{ domain.tld }
								</Text>
								<Text>{ domain.price }</Text>
							</HStack>
							<Button variant="link" onClick={ () => cart.onRemoveItem( domain ) }>
								{ __( 'Remove' ) }
							</Button>
						</VStack>
					</CardBody>
				</Card>
			) ) }
		</VStack>
	);
};
