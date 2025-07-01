import {
	Card,
	CardBody,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useDomainSearch } from '../DomainSearch/DomainSearch';

export const DomainsFullCartItems = () => {
	const { __ } = useI18n();
	const { cart } = useDomainSearch();

	return (
		<VStack spacing={ 3 }>
			{ cart.items.map( ( domain ) => (
				<Card key={ `${ domain.domain }.${ domain.tld }` }>
					<CardBody size="small">
						<HStack alignment="top" justify="space-between" spacing={ 6 }>
							<VStack spacing={ 2 }>
								<Text size="medium">
									{ domain.domain }
									<Text size="inherit" weight={ 500 }>
										.{ domain.tld }
									</Text>
								</Text>
								<Button variant="link" onClick={ () => cart.onRemoveItem( domain ) }>
									{ __( 'Remove' ) }
								</Button>
							</VStack>
							<VStack>
								<HStack alignment="right" spacing={ 2 }>
									{ domain.originalPrice && (
										<Text size="small" style={ { textDecoration: 'line-through' } }>
											{ domain.originalPrice }
										</Text>
									) }
									<Text size="small">
										{ sprintf(
											// translators: %(price)s is the price of the domain.
											__( '%(price)s/year' ),
											{ price: domain.price }
										) }
									</Text>
								</HStack>
							</VStack>
						</HStack>
					</CardBody>
				</Card>
			) ) }
		</VStack>
	);
};
