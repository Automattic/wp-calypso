import { Card } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import page from 'page';
import { PropsWithChildren, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import { EmailVerificationGate } from 'calypso/components/email-verification/email-verification-gate';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedDomain } from 'calypso/lib/domains';
import { ResponseDomain } from 'calypso/lib/domains/types';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { GOOGLE_PROVIDER_NAME } from 'calypso/lib/gsuite/constants';
import { getTitanProductName } from 'calypso/lib/titan';
import { TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import AddEmailAddressesCardPlaceholder from 'calypso/my-sites/email/add-mailboxes/add-users-placeholder';
import EmailProviderPricingNotice from 'calypso/my-sites/email/add-mailboxes/email-provider-pricing-notice';
import {
	EVENT_CANCEL_BUTTON_CLICK,
	EVENT_CONTINUE_BUTTON_CLICK,
	getTracksEventName,
} from 'calypso/my-sites/email/add-mailboxes/get-tracks-event-name';
import TitanUnusedMailboxesNotice from 'calypso/my-sites/email/add-mailboxes/titan-unused-mailboxes-notice';
import EmailHeader from 'calypso/my-sites/email/email-header';
import { NewMailBoxList } from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';
import getMailProductForProvider from 'calypso/my-sites/email/form/mailboxes/components/selectors/get-mail-product-for-provider';
import getCartItems from 'calypso/my-sites/email/form/mailboxes/components/utilities/get-cart-items';
import { getEmailProductProperties } from 'calypso/my-sites/email/form/mailboxes/components/utilities/get-email-product-properties';
import { MailboxOperations } from 'calypso/my-sites/email/form/mailboxes/components/utilities/mailbox-operations';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { INBOX_SOURCE } from 'calypso/my-sites/email/inbox/constants';
import {
	emailManagement,
	emailManagementInbox,
	emailManagementTitanSetUpMailbox,
} from 'calypso/my-sites/email/paths';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { translate } from 'i18n-calypso';

interface AddMailboxesProps {
	provider?: EmailProvider;
	selectedDomainName: string;
	source?: string;
}

interface AddMailboxesAdditionalProps {
	currentRoute: string;
	isLoadingDomains: boolean;
	isSelectedDomainNameValid: boolean;
	provider: EmailProvider;
	selectedDomain: ResponseDomain;
	selectedDomainName: string;
	selectedSite: SiteData;
	selectedSiteId: number;
	source: string;
	translate: typeof translate;
}

const isTitan = ( provider: EmailProvider ): boolean => provider === EmailProvider.Titan;

const useAdditionalProps = ( {
	provider = EmailProvider.Titan,
	selectedDomainName,
	source = '',
}: AddMailboxesProps ): AddMailboxesAdditionalProps => {
	const selectedSite = useSelector( getSelectedSite ) as SiteData;
	const selectedSiteId: number = selectedSite.ID;
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSiteId ) );
	const isLoadingDomains = useSelector(
		( state ) =>
			! hasLoadedSiteDomains( state, selectedSiteId ) ||
			isRequestingSiteDomains( state, selectedSiteId )
	);

	const selectedDomain = getSelectedDomain( {
		domains,
		selectedDomainName,
	} );
	const currentRoute = useSelector( getCurrentRoute );
	const translate = useTranslate();

	const isSelectedDomainNameValid = !! selectedDomain;

	return {
		currentRoute,
		isLoadingDomains,
		isSelectedDomainNameValid,
		provider,
		selectedDomain,
		selectedDomainName,
		selectedSite,
		selectedSiteId,
		source,
		translate,
	};
};

const recordClickEvent = ( {
	eventName,
	eventProps = {},
	provider,
	selectedDomainName,
	source = '',
}: {
	eventName: string;
	eventProps?: Record< string, unknown >;
	provider: EmailProvider;
	selectedDomainName: string;
	source?: string;
} ) => {
	recordTracksEvent( eventName, {
		...eventProps,
		domain_name: selectedDomainName,
		provider: isTitan( provider ) ? TITAN_PROVIDER_NAME : GOOGLE_PROVIDER_NAME,
		source,
	} );
};

const WithVerificationGate = ( {
	children,
	productFamily,
	provider,
}: PropsWithChildren< {
	productFamily: TranslateResult | string;
	provider: EmailProvider;
} > ) => {
	const translate = useTranslate();

	if ( isTitan( provider ) ) {
		return <>{ children }</>;
	}

	return (
		<EmailVerificationGate
			noticeText={ translate( 'You must verify your email to purchase %(productFamily)s.', {
				args: { productFamily },
				comment: '%(productFamily)s can be either "G Suite" or "Google Workspace"',
			} ) }
			noticeStatus="is-info"
		>
			{ children }
		</EmailVerificationGate>
	);
};

const MailboxNotices = ( {
	currentRoute,
	isLoadingDomains,
	emailProduct,
	provider,
	selectedDomainName,
	selectedDomain,
	selectedSite,
	source,
}: AddMailboxesAdditionalProps & { emailProduct: ProductListItem | null } ): JSX.Element | null => {
	if ( isLoadingDomains ) {
		return null;
	}

	const { existingItemsCount } = getEmailProductProperties(
		provider,
		selectedDomain,
		emailProduct as ProductListItem
	);

	const handleUnusedMailboxFinishSetupClick = (): void => {
		recordClickEvent( {
			eventName: 'calypso_email_management_titan_add_mailboxes_create_mailbox_click',
			provider,
			selectedDomainName,
			source,
		} );

		page( emailManagementTitanSetUpMailbox( selectedSite.slug, selectedDomainName, currentRoute ) );
	};

	return (
		<>
			{ selectedDomain && isTitan( provider ) && (
				<TitanUnusedMailboxesNotice
					domain={ selectedDomain }
					maxTitanMailboxCount={ existingItemsCount }
					onFinishSetupClick={ handleUnusedMailboxFinishSetupClick }
				/>
			) }

			<EmailProviderPricingNotice
				emailProduct={ emailProduct }
				provider={ provider }
				selectedDomain={ selectedDomain }
			/>
		</>
	);
};

const MailboxesForm = ( {
	goToEmail,
	isLoadingDomains,
	emailProduct,
	provider,
	selectedDomain,
	selectedDomainName,
	selectedSite,
	source,
	translate,
}: AddMailboxesAdditionalProps & {
	emailProduct: ProductListItem | null;
	goToEmail: () => void;
} ): JSX.Element => {
	const [ state, setState ] = useState( { isValidating: false, isAddingToCart: false } );

	const cartKey = useCartKey();
	const cartManager = useShoppingCart( cartKey );

	if ( isLoadingDomains || ! emailProduct ) {
		return <AddEmailAddressesCardPlaceholder />;
	}

	const onCancel = () => {
		recordClickEvent( {
			eventName: getTracksEventName( provider, EVENT_CANCEL_BUTTON_CLICK ),
			provider,
			selectedDomainName,
			source,
		} );
		goToEmail();
	};

	const onSubmit = async ( mailboxOperations: MailboxOperations ) => {
		const mailProperties = getEmailProductProperties(
			provider,
			selectedDomain,
			emailProduct,
			mailboxOperations.mailboxes.length
		);

		const recordContinueEvent = ( { canContinue }: { canContinue: boolean } ) => {
			recordClickEvent( {
				eventName: getTracksEventName( provider, EVENT_CONTINUE_BUTTON_CLICK ),
				eventProps: {
					can_continue: canContinue,
					mailbox_count: mailboxOperations.mailboxes.length,
				},
				provider,
				selectedDomainName,
				source,
			} );
		};

		setState( { ...state, isValidating: true } );
		if (
			! ( await mailboxOperations.validateAndCheck( mailProperties.isAdditionalMailboxesPurchase ) )
		) {
			recordContinueEvent( { canContinue: false } );
			setState( { ...state, isValidating: false } );
			return;
		}

		recordContinueEvent( { canContinue: true } );
		setState( { ...state, isAddingToCart: true } );

		cartManager
			.addProductsToCart( [ getCartItems( mailboxOperations.mailboxes, mailProperties ) ] )
			.then( () => {
				page( '/checkout/' + selectedSite.slug );
			} )
			.finally( () => setState( { ...state, isAddingToCart: false } ) );
	};

	return (
		<>
			<SectionHeader label={ translate( 'Add New Mailboxes' ) } />

			<Card>
				<NewMailBoxList
					areButtonsBusy={ state.isAddingToCart || state.isValidating }
					onSubmit={ onSubmit }
					onCancel={ onCancel }
					provider={ provider }
					selectedDomainName={ selectedDomainName }
					showAddNewMailboxButton
					showCancelButton
					submitActionText={ translate( 'Continue' ) }
				/>
			</Card>
		</>
	);
};

const AddMailboxes = ( props: AddMailboxesProps ): JSX.Element | null => {
	const additionalProps = useAdditionalProps( props );
	const {
		currentRoute,
		isLoadingDomains,
		provider,
		selectedDomain,
		selectedDomainName,
		selectedSite,
		source,
		translate,
	} = additionalProps;

	const emailProduct = useSelector( ( state ) =>
		getMailProductForProvider( state, provider, selectedDomain )
	);

	const isSelectedDomainNameValid = !! selectedDomain;

	const productName = isTitan( provider )
		? getTitanProductName()
		: getGoogleMailServiceFamily( emailProduct?.product_slug );

	const goToEmail = (): void => {
		let url = emailManagement(
			selectedSite.slug,
			isSelectedDomainNameValid ? selectedDomainName : null,
			currentRoute,
			{ source }
		);

		if ( source === INBOX_SOURCE ) {
			url = emailManagementInbox( selectedSite.slug );
		}

		page( url );
	};

	if ( ! isLoadingDomains && ! isSelectedDomainNameValid ) {
		goToEmail();

		return null;
	}

	return (
		<>
			<QueryProductsList />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<Main wideLayout={ true }>
				<DocumentHead title={ translate( 'Add New Mailboxes' ) } />

				<EmailHeader />

				<HeaderCake onClick={ goToEmail }>{ productName + ': ' + selectedDomainName }</HeaderCake>

				<WithVerificationGate productFamily={ productName } provider={ provider }>
					<MailboxNotices { ...additionalProps } emailProduct={ emailProduct } />
					<MailboxesForm
						{ ...additionalProps }
						goToEmail={ goToEmail }
						emailProduct={ emailProduct }
					/>
				</WithVerificationGate>
			</Main>
		</>
	);
};

export default AddMailboxes;
