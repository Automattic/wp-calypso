import { Card } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getTitanProductName } from 'calypso/lib/titan';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import EmailHeader from 'calypso/my-sites/email/email-header';
import { NewMailBoxList } from 'calypso/my-sites/email/form/mailboxes/components/list';
import getMailProductForProvider from 'calypso/my-sites/email/form/mailboxes/components/selectors/get-mail-product-for-provider';
import getCartItems from 'calypso/my-sites/email/form/mailboxes/components/utilities/get-cart-items';
import { getMailProductProperties } from 'calypso/my-sites/email/form/mailboxes/components/utilities/get-mail-product-properties';
import { MailboxOperations } from 'calypso/my-sites/email/form/mailboxes/components/utilities/mailbox-operations';
import { FIELD_NAME } from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface TestComponentProps {
	selectedDomainName: string;
}

const TestComponent = ( { selectedDomainName }: TestComponentProps ): JSX.Element | null => {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const cartKey = useCartKey();
	const cartManager = useShoppingCart( cartKey );
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const selectedDomain = getSelectedDomain( {
		domains,
		selectedDomainName,
	} );

	const [ state, setState ] = useState( { isValidating: false, isAddingToCart: false } );

	const provider = EmailProvider.Google;
	const mailProduct = useSelector( ( state ) =>
		getMailProductForProvider( state, provider, selectedDomain )
	);

	if ( ! mailProduct ) {
		return <QueryProductsList persist />;
	}

	const onSubmit = async ( mailboxOperations: MailboxOperations ) => {
		const mailProperties = getMailProductProperties(
			provider,
			selectedDomain,
			mailProduct,
			mailboxOperations.mailboxes.length
		);

		setState( { ...state, isValidating: true } );
		if ( ! ( await mailboxOperations.validateAndCheck( mailProperties.isExtraItemPurchase ) ) ) {
			setState( { ...state, isValidating: false } );
			return;
		}

		setState( { ...state, isAddingToCart: true } );

		cartManager
			.addProductsToCart( [ getCartItems( mailboxOperations.mailboxes, mailProperties ) ] )
			.then( () => {
				page( '/checkout/' + selectedSite?.slug );
			} )
			.finally( () => setState( { ...state, isAddingToCart: false } ) );
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
						areButtonsBusy={ state.isAddingToCart || state.isValidating }
						hiddenFieldNames={ [ FIELD_NAME ] }
						onSubmit={ onSubmit }
						provider={ provider }
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
