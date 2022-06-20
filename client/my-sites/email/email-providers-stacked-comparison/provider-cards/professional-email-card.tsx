import { isEnabled } from '@automattic/calypso-config';
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
import {
	addToCartAndCheckout,
	recordTracksEventAddToCartClick,
} from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import NewMailboxList from 'calypso/my-sites/email/new-mailbox-list';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_FIRSTNAME,
} from 'calypso/my-sites/email/new-mailbox-list/constants';
import { Provider } from 'calypso/my-sites/email/new-mailbox-list/types';
import {
	getNewMailbox,
	validateMailboxes,
} from 'calypso/my-sites/email/new-mailbox-list/utilities';
import {
	TITAN_FULL_NAME_FIELD,
	TITAN_PASSWORD_RESET_FIELD,
} from 'calypso/my-sites/email/titan-new-mailbox';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-new-mailbox-list';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { EmailProvidersStackedCardProps, ProviderCardProps } from './provider-card-props';
import type { ReactElement } from 'react';

import './professional-email-card.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

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

	const [ mailboxes, setMailboxes ] = useState( [ getNewMailbox( selectedDomainName ) ] );

	const [ addingToCart, setAddingToCart ] = useState( false );
	const [ validatedTitanMailboxUuids, setValidatedTitanMailboxUuids ] = useState( [ '' ] );
	const optionalFields = [ TITAN_PASSWORD_RESET_FIELD, TITAN_FULL_NAME_FIELD ];

	const professionalEmail: ProviderCardProps = { ...professionalEmailCardInformation };
	professionalEmail.detailsExpanded = detailsExpanded;

	const onTitanConfirmNewMailboxes = () => {
		window.console.log( mailboxes );
		const validatedTitanMailboxes = isEnabled( 'email-provider-card/unified' )
			? ( validateMailboxes( mailboxes ) as [  ] )
			: validateTitanMailboxes( titanMailbox, optionalFields );

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
		window.console.log( [
			'validatedTitanMailboxes',
			validatedTitanMailboxes,
			'comparisonContext',
			comparisonContext,
			'validatedMailboxUuids',
			validatedMailboxUuids,
			'mailboxesAreValid',
			mailboxesAreValid,
			'provider',
			TITAN_PROVIDER_NAME,
			'source',
			source ?? '',
			'userCanAddEmail',
			userCanAddEmail,
			'userCannotAddEmailReason',
			userCannotAddEmailReason,
		] );
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

	const onTitanFormReturnKeyPress = noop;

	professionalEmail.onExpandedChange = onExpandedChange;
	professionalEmail.priceBadge = (
		<ProfessionalEmailPrice { ...{ domain, intervalLength, isDomainInCart } } />
	);

	if ( isEnabled( 'email-provider-card/unified' ) ) {
		professionalEmail.formFields = (
			<NewMailboxList
				hiddenFieldNames={ [ FIELD_FIRSTNAME, FIELD_ALTERNATIVE_EMAIL ] }
				mailboxes={ mailboxes }
				onMailboxesChange={ setMailboxes }
				onReturnKeyPress={ onTitanFormReturnKeyPress }
				provider={ Provider.Titan }
				selectedDomainName={ selectedDomainName }
				validatedMailboxUuids={ validatedTitanMailboxUuids }
			>
				<FullWidthButton
					className="professional-email-card__continue"
					primary
					busy={ addingToCart }
					onClick={ onTitanConfirmNewMailboxes }
				>
					{ translate( 'Create your mailbox' ) }
				</FullWidthButton>
			</NewMailboxList>
		);
	} else {
		professionalEmail.formFields = (
			<TitanNewMailboxList
				onMailboxesChange={ setTitanMailbox }
				mailboxes={ titanMailbox }
				selectedDomainName={ selectedDomainName }
				onReturnKeyPress={ onTitanFormReturnKeyPress }
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
	}

	return <EmailProvidersStackedCard { ...professionalEmail } />;
};

export default ProfessionalEmailCard;
