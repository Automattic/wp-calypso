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
import { useState } from 'react';
import { useDomainSearch } from '../domain-search';
import type { SelectedDomain } from '../domain-search/types';

export const DomainsFullCartItem = ( { domain }: { domain: SelectedDomain } ) => {
	const { __ } = useI18n();
	const { cart, isBusy, setIsBusy } = useDomainSearch();
	const [ error, setError ] = useState< string | null >( null );

	const removeItem = async () => {
		setIsBusy( true );

		try {
			await cart.onRemoveItem( domain.uuid );
		} catch {
			setError( __( 'There was a problem removing your domain. Please try again.' ) );
		} finally {
			setIsBusy( false );
		}
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
								disabled={ isBusy }
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
					{ error && (
						<Notice onRemove={ () => setError( null ) } status="error">
							{ error }
						</Notice>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
};
