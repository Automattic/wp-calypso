import { Gridicon } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
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
import { getTitanProductName } from 'calypso/lib/titan';
import { TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import ProfessionalEmailPrice from 'calypso/my-sites/email/email-providers-comparison/price/professional-email';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import {
	addToCartAndCheckout,
	recordTracksEventAddToCartClick,
} from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_DOMAIN,
	FIELD_IS_ADMIN,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_UUID,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { getFormFieldValue } from 'calypso/my-sites/email/form/mailboxes/field-selectors';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import NewMailboxList from 'calypso/my-sites/email/form/new-mailbox-list';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { EmailProvidersStackedCardProps, ProviderCardProps } from './provider-card-props';
import type { ReactElement } from 'react';
import './professional-email-card.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const logo = <Gridicon className="professional-email-card-new__logo" icon="my-sites" />;
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

const transformMailboxForCart = ( mailbox: MailboxForm< EmailProvider > ) => ( {
	alternative_email: getFormFieldValue( mailbox, FIELD_ALTERNATIVE_EMAIL ) as string,
	email: `${ getFormFieldValue( mailbox, FIELD_MAILBOX ) }@${ getFormFieldValue(
		mailbox,
		FIELD_DOMAIN
	) }`,
	is_admin: Boolean( getFormFieldValue( mailbox, FIELD_IS_ADMIN ) ),
	name: getFormFieldValue( mailbox, FIELD_NAME ) as string,
	password: getFormFieldValue( mailbox, FIELD_PASSWORD ) as string,
} );

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

	const [ mailboxes, setMailboxes ] = useState( [
		new MailboxForm< EmailProvider >( EmailProvider.Titan, selectedDomainName ),
	] );
	const [ addingToCart, setAddingToCart ] = useState( false );
	const [ validatedTitanMailboxUuids, setValidatedTitanMailboxUuids ] = useState( [ '' ] );

	const professionalEmail: ProviderCardProps = { ...professionalEmailCardInformation };
	professionalEmail.detailsExpanded = detailsExpanded;

	const onTitanConfirmNewMailboxes = () => {
		mailboxes.forEach( ( mailbox ) => mailbox.validate() );

		const validMailboxes = mailboxes.filter( ( mailbox ) => mailbox.isValid() );
		const mailboxesAreValid = mailboxes.length === validMailboxes.length;

		const userCanAddEmail = isDomainInCart || canCurrentUserAddEmail( domain );
		const userCannotAddEmailReason = userCanAddEmail
			? null
			: getCurrentUserCannotAddEmailReason( domain );

		const validatedMailboxUuids = validMailboxes.map(
			( mailbox ) => getFormFieldValue( mailbox, FIELD_UUID ) as string
		);

		recordTracksEventAddToCartClick(
			comparisonContext,
			validatedMailboxUuids,
			mailboxesAreValid,
			TITAN_PROVIDER_NAME,
			source ?? '',
			userCanAddEmail,
			userCannotAddEmailReason
		);

		setMailboxes( validMailboxes );
		setValidatedTitanMailboxUuids( validatedMailboxUuids );

		if ( ! mailboxesAreValid || ! userCanAddEmail ) {
			return;
		}

		const props: TitanProductProps = {
			domain: selectedDomainName,
			quantity: validMailboxes.length,
			extra: {
				email_users: validMailboxes.map( transformMailboxForCart ),
				new_quantity: validMailboxes.length,
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

	const onTitanFormReturnKeyPress = noop;

	professionalEmail.onExpandedChange = onExpandedChange;
	professionalEmail.priceBadge = (
		<ProfessionalEmailPrice { ...{ domain, intervalLength, isDomainInCart } } />
	);

	professionalEmail.formFields = (
		<NewMailboxList
			onMailboxesChange={ setMailboxes }
			mailboxes={ mailboxes }
			selectedDomainName={ selectedDomainName }
			onReturnKeyPress={ onTitanFormReturnKeyPress }
			validatedMailboxUuids={ validatedTitanMailboxUuids }
			showAddAnotherMailboxButton={ false }
			hiddenFieldNames={ [ FIELD_NAME, FIELD_ALTERNATIVE_EMAIL, FIELD_IS_ADMIN ] }
			provider={ EmailProvider.Titan }
		>
			<FullWidthButton
				className="professional-email-card-new__continue"
				primary
				busy={ addingToCart }
				onClick={ onTitanConfirmNewMailboxes }
			>
				{ translate( 'Create your mailbox (new+)' ) }
			</FullWidthButton>
		</NewMailboxList>
	);

	return <EmailProvidersStackedCard { ...professionalEmail } />;
};

export default ProfessionalEmailCard;
