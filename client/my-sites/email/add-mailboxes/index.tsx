import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { MouseEvent, PropsWithChildren, useState } from 'react';
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
import PasswordResetTipField from 'calypso/my-sites/email/form/mailboxes/components/password-reset-tip-field';
import getMailProductForProvider from 'calypso/my-sites/email/form/mailboxes/components/selectors/get-mail-product-for-provider';
import getCartItems from 'calypso/my-sites/email/form/mailboxes/components/utilities/get-cart-items';
import { getEmailProductProperties } from 'calypso/my-sites/email/form/mailboxes/components/utilities/get-email-product-properties';
import { MailboxOperations } from 'calypso/my-sites/email/form/mailboxes/components/utilities/mailbox-operations';
import {
	FIELD_NAME,
	FIELD_PASSWORD_RESET_EMAIL,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { usePasswordResetEmailField } from 'calypso/my-sites/email/hooks/use-password-reset-email-field';
import { MAILBOXES_SOURCE } from 'calypso/my-sites/email/mailboxes/constants';
import {
	getEmailCheckoutPath,
	getEmailManagementPath,
	getMailboxesPath,
	getTitanSetUpMailboxPath,
} from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { HiddenFieldNames } from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';
import type { translate } from 'i18n-calypso';

interface AddMailboxesProps {
	provider?: EmailProvider;
	selectedDomainName: string;
	source?: string;
	showPageHeader?: boolean;
	showFormHeader?: boolean;
	customFormHeader?: boolean;
}

interface AddMailboxesAdditionalProps {
	currentRoute: string;
	isLoadingDomains: boolean;
	isSelectedDomainNameValid: boolean;
	provider: EmailProvider;
	selectedDomain: ResponseDomain;
	selectedDomainName: string;
	selectedSite: SiteDetails | undefined | null;
	selectedSiteId: number | undefined | null;
	source: string;
	translate: typeof translate;
	showPageHeader?: boolean;
	showFormHeader?: boolean;
	customFormHeader?: boolean;
}

const isTitan = ( provider: EmailProvider ): boolean => provider === EmailProvider.Titan;

const useAdditionalProps = ( {
	provider = EmailProvider.Titan,
	selectedDomainName,
	source = '',
	showPageHeader = true,
	showFormHeader = true,
	customFormHeader,
}: AddMailboxesProps ): AddMailboxesAdditionalProps => {
	const selectedSite = useSelector( getSelectedSite );
	const selectedSiteId = selectedSite?.ID;
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSiteId ) );
	const isLoadingDomains = useSelector( ( state ) => {
		if ( ! selectedSiteId ) {
			return true;
		}
		return (
			! hasLoadedSiteDomains( state, selectedSiteId ) ||
			isRequestingSiteDomains( state, selectedSiteId )
		);
	} );

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
		showPageHeader,
		showFormHeader,
		customFormHeader,
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

	const emailProductProperties = emailProduct
		? getEmailProductProperties( provider, selectedDomain, emailProduct )
		: { existingItemsCount: 0 };
	const { existingItemsCount } = emailProductProperties;

	const handleUnusedMailboxFinishSetupClick = (): void => {
		recordClickEvent( {
			eventName: 'calypso_email_management_titan_add_mailboxes_create_mailbox_click',
			provider,
			selectedDomainName,
			source,
		} );

		if ( ! selectedSite ) {
			throw new Error( 'Cannot finish unused mailbox setup without selected site' );
		}

		page( getTitanSetUpMailboxPath( selectedSite.slug, selectedDomainName, currentRoute ) );
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
	showFormHeader,
	customFormHeader,
	currentRoute,
}: AddMailboxesAdditionalProps & {
	emailProduct: ProductListItem | null;
	goToEmail: () => void;
} ): JSX.Element => {
	const [ isAddingToCart, setIsAddingToCart ] = useState( false );
	const [ isValidating, setIsValidating ] = useState( false );

	const defaultHiddenFields: HiddenFieldNames[] = [ FIELD_NAME ];

	const { hiddenFields, initialValue: passwordResetEmailFieldInitialValue } =
		usePasswordResetEmailField( {
			selectedDomainName,
			defaultHiddenFields,
		} );

	const [ hiddenFieldNames, setHiddenFieldNames ] = useState< HiddenFieldNames[] >( hiddenFields );

	const cartKey = useCartKey();
	const cartManager = useShoppingCart( cartKey );

	if ( isLoadingDomains || ! emailProduct ) {
		return <AddEmailAddressesCardPlaceholder />;
	}

	const showPasswordResetEmailField = ( event: MouseEvent< HTMLElement > ) => {
		event.preventDefault();
		setHiddenFieldNames( [ FIELD_NAME ] );
	};

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

		setIsValidating( true );
		if (
			! ( await mailboxOperations.validateAndCheck( mailProperties.isAdditionalMailboxesPurchase ) )
		) {
			recordContinueEvent( { canContinue: false } );
			setIsValidating( false );
			return;
		}

		setIsValidating( false );
		recordContinueEvent( { canContinue: true } );
		setIsAddingToCart( true );

		const checkoutPath = getEmailCheckoutPath(
			selectedSite?.slug ?? '',
			selectedDomainName,
			currentRoute,
			mailboxOperations.mailboxes[ 0 ].getAsCartItem().email
		);

		cartManager
			.addProductsToCart( [ getCartItems( mailboxOperations.mailboxes, mailProperties ) ] )
			.then( () => {
				page( checkoutPath );
			} )
			.finally( () => setIsAddingToCart( false ) )
			.catch( () => {
				// Nothing needs to be done here. CartMessages will display the error to the user.
			} );
	};

	return (
		<>
			{ showFormHeader && <SectionHeader label={ translate( 'Add New Mailboxes' ) } /> }

			<Card className="new-mailbox">
				{ !! customFormHeader && (
					<div className="section-header__label">
						<span className="section-header__label-text">{ customFormHeader }</span>
					</div>
				) }
				<NewMailBoxList
					areButtonsBusy={ isAddingToCart || isValidating }
					hiddenFieldNames={ hiddenFieldNames }
					initialFieldValues={ {
						[ FIELD_PASSWORD_RESET_EMAIL ]: passwordResetEmailFieldInitialValue,
					} }
					onSubmit={ onSubmit }
					onCancel={ onCancel }
					provider={ provider }
					selectedDomainName={ selectedDomainName }
					showAddNewMailboxButton
					showCancelButton
					submitActionText={ translate( 'Continue' ) }
				>
					{ hiddenFieldNames.includes( FIELD_PASSWORD_RESET_EMAIL ) && (
						<PasswordResetTipField tipClickHandler={ showPasswordResetEmailField } />
					) }
				</NewMailBoxList>
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
		showPageHeader,
	} = additionalProps;

	const emailProduct = useSelector( ( state ) =>
		getMailProductForProvider( state, provider, selectedDomain )
	);

	const isSelectedDomainNameValid = !! selectedDomain;

	const productName = isTitan( provider )
		? getTitanProductName()
		: getGoogleMailServiceFamily( emailProduct?.product_slug );

	const goToEmail = (): void => {
		let url = getEmailManagementPath(
			selectedSite?.slug,
			isSelectedDomainNameValid ? selectedDomainName : null,
			currentRoute,
			{ source }
		);

		if ( source === MAILBOXES_SOURCE ) {
			url = getMailboxesPath( selectedSite?.slug );
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

			<Main wideLayout>
				<DocumentHead title={ translate( 'Add New Mailboxes' ) } />

				{ showPageHeader && (
					<>
						<EmailHeader />
						<HeaderCake onClick={ goToEmail }>
							{ productName + ': ' + selectedDomainName }
						</HeaderCake>
					</>
				) }

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
