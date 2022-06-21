import { isEnabled } from '@automattic/calypso-config';
import { Button, Gridicon } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { translate, useTranslate } from 'i18n-calypso';
import { MouseEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import {
	titanMailMonthly,
	titanMailYearly,
	TitanProductProps,
} from 'calypso/lib/cart-values/cart-items';
import {
	canCurrentUserAddEmail,
	getCurrentUserCannotAddEmailReason,
	getSelectedDomain,
} from 'calypso/lib/domains';
import { getTitanProductName, getTitanProductSlug } from 'calypso/lib/titan';
import { TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	transformMailboxForCart,
	validateMailboxes as validateTitanMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import ProfessionalEmailPrice from 'calypso/my-sites/email/email-providers-comparison/price/professional-email';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import getOnSubmitNewMailboxesHandler from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/get-on-submit-new-mailboxes-handler';
import {
	addToCartAndCheckout,
	recordTracksEventAddToCartClick,
} from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import {
	HiddenFieldNames,
	NewMailBoxList,
} from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_NAME,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import {
	TITAN_FULL_NAME_FIELD,
	TITAN_PASSWORD_RESET_FIELD,
} from 'calypso/my-sites/email/titan-new-mailbox';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-new-mailbox-list';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { EmailProvidersStackedCardProps, ProviderCardProps } from './provider-card-props';
import type { ReactElement } from 'react';

import './professional-email-card.scss';

const logo = <Gridicon className="professional-email-card__logo" icon="my-sites" />;
const badge = (
	<img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan', { textOnly: true } ) } />
);

const getTitanFeatures = () => {
	return [
		translate( 'Send and receive from your custom domain' ),
		translate( '30GB storage' ),
		translate( 'Email, calendars, and contacts' ),
		translate( '24/7 support via email' ),
	];
};

const professionalEmailCardInformation: ProviderCardProps = {
	className: 'professional-email-card',
	expandButtonLabel: translate( 'Select' ),
	providerKey: 'titan',
	showExpandButton: true,
	description: translate(
		'Integrated email solution with powerful features. Manage your email and more on any device.'
	),
	logo,
	productName: getTitanProductName(),
	footerBadge: badge,
	features: getTitanFeatures(),
};

const ProfessionalEmailCard = ( {
	comparisonContext,
	detailsExpanded,
	intervalLength,
	isDomainInCart = false,
	onExpandedChange,
	selectedDomainName,
	source,
}: EmailProvidersStackedCardProps ): ReactElement => {
	const selectedSite = useSelector( getSelectedSite );
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: selectedDomainName,
	} );

	const cartKey = useCartKey();
	const shoppingCartManager = useShoppingCart( cartKey );

	const [ titanMailbox, setTitanMailbox ] = useState( [
		buildNewTitanMailbox( selectedDomainName, false ),
	] );
	const [ addingToCart, setAddingToCart ] = useState( false );
	const [ validatedTitanMailboxUuids, setValidatedTitanMailboxUuids ] = useState( [ '' ] );
	const optionalFields = [ TITAN_PASSWORD_RESET_FIELD, TITAN_FULL_NAME_FIELD ];

	const professionalEmail: ProviderCardProps = { ...professionalEmailCardInformation };
	professionalEmail.detailsExpanded = detailsExpanded;

	const onTitanConfirmNewMailboxes = () => {
		const validatedTitanMailboxes = validateTitanMailboxes( titanMailbox, optionalFields );

		const mailboxesAreValid = areAllMailboxesValid( validatedTitanMailboxes, optionalFields );
		const userCanAddEmail = isDomainInCart || canCurrentUserAddEmail( domain );
		const userCannotAddEmailReason = userCanAddEmail
			? null
			: getCurrentUserCannotAddEmailReason( domain );

		const validatedMailboxUuids = validatedTitanMailboxes.map( ( mailbox ) => mailbox.uuid );
		recordTracksEventAddToCartClick(
			comparisonContext,
			validatedMailboxUuids,
			mailboxesAreValid,
			TITAN_PROVIDER_NAME,
			source ?? '',
			userCanAddEmail,
			userCannotAddEmailReason
		);

		setTitanMailbox( titanMailbox );
		setValidatedTitanMailboxUuids( validatedMailboxUuids );

		if ( ! mailboxesAreValid || ! userCanAddEmail ) {
			return;
		}

		const props: TitanProductProps = {
			domain: selectedDomainName,
			quantity: validatedTitanMailboxes.length,
			extra: {
				email_users: validatedTitanMailboxes.map( transformMailboxForCart ),
				new_quantity: validatedTitanMailboxes.length,
			},
		};

		const cartItem =
			intervalLength === IntervalLength.MONTHLY
				? titanMailMonthly( props )
				: titanMailYearly( props );

		addToCartAndCheckout(
			shoppingCartManager,
			cartItem,
			setAddingToCart,
			selectedSite?.slug ?? ''
		);
	};

	professionalEmail.onExpandedChange = onExpandedChange;
	professionalEmail.priceBadge = (
		<ProfessionalEmailPrice { ...{ domain, intervalLength, isDomainInCart } } />
	);

	professionalEmail.formFields = (
		<TitanNewMailboxList
			onMailboxesChange={ setTitanMailbox }
			mailboxes={ titanMailbox }
			selectedDomainName={ selectedDomainName }
			validatedMailboxUuids={ validatedTitanMailboxUuids }
			showAddAnotherMailboxButton={ false }
			hiddenFieldNames={ [ TITAN_FULL_NAME_FIELD, TITAN_PASSWORD_RESET_FIELD ] }
		>
			<FullWidthButton
				className="professional-email-card__continue"
				primary
				busy={ addingToCart }
				onClick={ onTitanConfirmNewMailboxes }
			>
				{ translate( 'Create your mailbox' ) }
			</FullWidthButton>
		</TitanNewMailboxList>
	);

	return <EmailProvidersStackedCard { ...professionalEmail } />;
};

const ProfessionalEmailCardNew = ( props: EmailProvidersStackedCardProps ): ReactElement => {
	const {
		detailsExpanded,
		intervalLength,
		isDomainInCart = false,
		onExpandedChange,
		selectedDomainName,
	} = props;
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const siteSlug = selectedSite?.slug ?? '';
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: selectedDomainName,
	} );
	const emailProduct = useSelector( ( state ) =>
		getProductBySlug( state, getTitanProductSlug( domain ) as string )
	);
	const provider = EmailProvider.Titan;

	const cartKey = useCartKey();
	const dispatch = useDispatch();
	const shoppingCartManager = useShoppingCart( cartKey );
	const [ addingToCart, setAddingToCart ] = useState( false );

	const [ hiddenFieldNames, setHiddenFieldNames ] = useState< HiddenFieldNames[] >( [
		FIELD_NAME,
		FIELD_ALTERNATIVE_EMAIL,
	] );

	const userEmail = useSelector( getCurrentUserEmail );

	const showAlternateEmailField = ( event: MouseEvent< HTMLElement > ) => {
		event.preventDefault();
		setHiddenFieldNames( [ FIELD_NAME ] );
	};

	const professionalEmail: ProviderCardProps = { ...professionalEmailCardInformation };
	professionalEmail.detailsExpanded = detailsExpanded;

	professionalEmail.onExpandedChange = onExpandedChange;
	professionalEmail.priceBadge = (
		<ProfessionalEmailPrice { ...{ domain, intervalLength, isDomainInCart } } />
	);

	const handleSubmit = getOnSubmitNewMailboxesHandler( {
		...props,
		dispatch,
		domain,
		emailProduct,
		provider,
		setAddingToCart,
		shoppingCartManager,
		siteSlug,
	} );

	const PasswordResetFieldTip = () => {
		const translate = useTranslate();

		if ( ! hiddenFieldNames.includes( FIELD_ALTERNATIVE_EMAIL ) ) {
			return null;
		}

		return (
			<FormSettingExplanation>
				{ translate(
					'Your password reset email is {{strong}}%(userEmail)s{{/strong}}. {{a}}Change it{{/a}}.',
					{
						args: {
							userEmail,
						},
						components: {
							strong: <strong />,
							a: (
								<Button
									href="#"
									className="professional-email-card__change-it-button"
									onClick={ showAlternateEmailField }
									plain
								/>
							),
						},
					}
				) }
			</FormSettingExplanation>
		);
	};

	professionalEmail.formFields = (
		<NewMailBoxList
			areButtonsBusy={ addingToCart }
			hiddenFieldNames={ hiddenFieldNames }
			initialFieldValues={ { [ FIELD_ALTERNATIVE_EMAIL ]: userEmail } }
			onSubmit={ handleSubmit }
			provider={ provider }
			selectedDomainName={ selectedDomainName }
			showAddNewMailboxButton
			submitActionText={ translate( 'Purchase' ) }
		>
			<PasswordResetFieldTip />
		</NewMailBoxList>
	);

	return <EmailProvidersStackedCard { ...professionalEmail } />;
};

export default isEnabled( 'unify-mailbox-forms' )
	? ProfessionalEmailCardNew
	: ProfessionalEmailCard;
