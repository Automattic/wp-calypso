import { Card } from '@automattic/components';
import { TitanProductUser, useShoppingCart } from '@automattic/shopping-cart';
import { useEffect } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import { titanMailMonthly, titanMailYearly } from 'calypso/lib/cart-values/cart-items';
import { getSelectedDomain } from 'calypso/lib/domains';
import {
	getMaxTitanMailboxCount,
	getTitanProductName,
	getTitanProductSlug,
	hasTitanMailWithUs,
	isTitanMonthlyProduct,
} from 'calypso/lib/titan';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import EmailHeader from 'calypso/my-sites/email/email-header';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { NewMailBoxList } from 'calypso/my-sites/email/form/mailboxes/components/list';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface TestComponentProps {
	selectedDomainName: string;
}

const TestComponent = ( { selectedDomainName }: TestComponentProps ): JSX.Element => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const cartKey = useCartKey();
	const cartManager = useShoppingCart( cartKey );
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const selectedDomain = getSelectedDomain( {
		domains,
		selectedDomainName,
	} );

	const productSlug = getTitanProductSlug( selectedDomain );
	const maxTitanMailboxCount = hasTitanMailWithUs( selectedDomain )
		? getMaxTitanMailboxCount( selectedDomain )
		: 0;
	const titanMailProduct = useSelector( ( state ) =>
		productSlug ? getProductBySlug( state, productSlug ) : null
	);

	const [ state, setState ] = useState( { isCheckingAvailability: false, isAddingToCart: false } );

	useEffect( () => {
		state.isCheckingAvailability && setState( { ...state, isCheckingAvailability: false } );
	}, [ state ] );

	const getCartItems = ( mailboxes: MailboxForm< EmailProvider >[] ) => {
		const quantity = mailboxes.length + maxTitanMailboxCount;
		const new_quantity = mailboxes.length;
		const email_users = mailboxes.map( ( mailbox ) =>
			mailbox.getAsCartItem()
		) as unknown as TitanProductUser[];

		if ( ! titanMailProduct ) {
			return null;
		}

		const cartItemFunction = isTitanMonthlyProduct( titanMailProduct )
			? titanMailMonthly
			: titanMailYearly;

		return cartItemFunction( {
			domain: selectedDomainName,
			quantity,
			extra: {
				email_users,
				new_quantity,
			},
		} );
	};

	const areAllMailboxesValid = ( mailboxes: MailboxForm< EmailProvider >[] ): boolean => {
		return mailboxes.every( ( mailbox ) => mailbox.isValid() );
	};

	const onSubmit = async ( mailboxes: MailboxForm< EmailProvider >[], persistMailboxes ) => {
		mailboxes.forEach( ( mailbox ) => {
			mailbox.validate( true );
		} );

		if ( ! areAllMailboxesValid( mailboxes ) ) {
			return;
		}

		await Promise.all( mailboxes.map( ( mailbox ) => mailbox.validateOnDemand() ) );

		persistMailboxes();

		const cartItems = getCartItems( mailboxes );

		if ( ! areAllMailboxesValid( mailboxes ) || ! cartItems ) {
			return;
		}

		setState( { ...state, isAddingToCart: true } );
		cartManager
			.addProductsToCart( [ cartItems ] )
			.then( () => {
				setState( { ...state, isAddingToCart: false } );
				page( '/checkout/' + selectedSite?.slug );
			} )
			.catch( () => {
				setState( { ...state, isAddingToCart: false } );
			} );
	};

	return (
		<>
			<QueryProductsList />
			<Main wideLayout={ true }>
				<DocumentHead title={ translate( 'Add New Mailboxes' ) } />

				<EmailHeader />

				<HeaderCake>{ getTitanProductName() + ': ' + selectedDomainName }</HeaderCake>

				<SectionHeader label={ translate( 'Add New Mailboxes' ) } />

				<Card>
					<NewMailBoxList
						onSubmit={ onSubmit }
						provider={ EmailProvider.Titan }
						selectedDomainName={ selectedDomainName }
						showAddNewMailboxButton
						showCancelButton
						submitActionText={ translate( 'Continue' ) }
					/>
				</Card>
			</Main>
		</>
	);
};

export default TestComponent;
