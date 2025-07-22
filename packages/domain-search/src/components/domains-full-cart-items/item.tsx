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
import { useEffect, useRef, useState } from 'react';
import { useDomainSearch } from '../domain-search';
import type { SelectedDomain } from '../domain-search/types';

export const DomainsFullCartItem = ( { domain }: { domain: SelectedDomain } ) => {
	const { __ } = useI18n();
	const { cart } = useDomainSearch();
	const [ isBusy, setIsBusy ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState< string | null >( null );

	const initiatedByThisComponent = useRef( false );

	useEffect( () => {
		if ( ! initiatedByThisComponent.current ) {
			return;
		}

		if ( cart.isBusy ) {
			setIsBusy( true );
			setErrorMessage( null );

			return;
		}

		initiatedByThisComponent.current = false;

		setIsBusy( false );
		setErrorMessage( cart.errorMessage );
	}, [ cart.isBusy, cart.errorMessage ] );

	const removeItem = async () => {
		initiatedByThisComponent.current = true;
		cart.onRemoveItem( domain.uuid );
	};

	return (
		<Card>
			<CardBody size="small">
				<VStack spacing={ 4 }>
					<HStack alignment="top" justify="space-between" spacing={ 6 }>
						<VStack spacing={ 2 } alignment="left">
							<Text size="medium" aria-label={ `${ domain.domain }.${ domain.tld }` }>
								{ domain.domain }
								<Text size="inherit" weight={ 500 }>
									.{ domain.tld }
								</Text>
							</Text>
							<Button
								disabled={ cart.isBusy }
								isBusy={ isBusy }
								variant="link"
								className="domains-full-cart-items__remove"
								onClick={ removeItem }
							>
								{ __( 'Remove' ) }
							</Button>
						</VStack>
						<VStack className="domains-full-cart-items__price">
							<HStack alignment="right" spacing={ 2 }>
								{ domain.originalPrice && (
									<Text size="small" className="domains-full-cart-items__original-price">
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
					{ errorMessage && (
						<Notice status="error" onRemove={ () => setErrorMessage( null ) }>
							{ errorMessage }
						</Notice>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
};
