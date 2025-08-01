import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Notice,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { useFocusedCartAction } from '../../hooks/use-focused-cart-action';
import { useDomainSearch } from '../domain-search';
import type { SelectedDomain } from '../domain-search/types';

export const DomainsFullCartItem = ( { domain }: { domain: SelectedDomain } ) => {
	const { __ } = useI18n();
	const { cart } = useDomainSearch();
	const { isBusy, errorMessage, removeErrorMessage, callback } = useFocusedCartAction( () => {
		cart.onRemoveItem( domain.uuid );
	} );

	return (
		<Card>
			<CardBody size="small">
				<VStack spacing={ 4 }>
					<HStack alignment="top" justify="space-between" spacing={ 6 }>
						<VStack spacing={ 2 } alignment="left">
							<Text
								size="medium"
								aria-label={ `${ domain.domain }.${ domain.tld }` }
								style={ { wordBreak: 'break-all' } }
							>
								{ domain.domain }
								<Text size="inherit" weight={ 500 } style={ { whiteSpace: 'nowrap' } }>
									.{ domain.tld }
								</Text>
							</Text>
							<Button
								disabled={ cart.isBusy }
								isBusy={ isBusy }
								variant="link"
								className="domains-full-cart-items__remove"
								onClick={ callback }
							>
								{ __( 'Remove' ) }
							</Button>
						</VStack>
						<VStack className="domains-full-cart-items__price">
							<HStack alignment="right" spacing={ 2 }>
								{ domain.salePrice ? (
									<>
										<Text size="small" className="domains-full-cart-items__original-price">
											{ sprintf(
												// translators: %(price)s is the price of the domain.
												__( '%(price)s/year' ),
												{ price: domain.price }
											) }
										</Text>
										<Text size="small">{ domain.salePrice }</Text>
									</>
								) : (
									<Text size="small">
										{ sprintf(
											// translators: %(price)s is the price of the domain.
											__( '%(price)s/year' ),
											{ price: domain.price }
										) }
									</Text>
								) }
							</HStack>
						</VStack>
					</HStack>
					{ errorMessage && (
						<Notice status="error" onRemove={ removeErrorMessage }>
							{ errorMessage }
						</Notice>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
};
