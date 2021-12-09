import { TITAN_MAIL_MONTHLY_SLUG } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { withShoppingCart } from '@automattic/shopping-cart';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import page from 'page';
import React, { FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import PromoCardPrice from 'calypso/components/promo-section/promo-card/price';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import { titanMailMonthly } from 'calypso/lib/cart-values/cart-items';
import {
	getSelectedDomain,
	canCurrentUserAddEmail,
	getCurrentUserCannotAddEmailReason,
} from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { getTitanProductName, isDomainEligibleForTitanFreeTrial } from 'calypso/lib/titan';
import { TITAN_PROVIDER_NAME } from 'calypso/lib/titan/constants';
import {
	areAllMailboxesValid,
	buildNewTitanMailbox,
	transformMailboxForCart,
	validateMailboxes as validateTitanMailboxes,
} from 'calypso/lib/titan/new-mailbox';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import {
	TITAN_PASSWORD_RESET_FIELD,
	TITAN_FULL_NAME_FIELD,
} from 'calypso/my-sites/email/titan-new-mailbox';
import TitanNewMailboxList from 'calypso/my-sites/email/titan-new-mailbox-list';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug, getProductsList } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { EmailProvidersStackedCardProps, ProviderCard } from './provider-card-props';

import './professional-email-card.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const logo = <Gridicon className="professional-email-card__logo" icon="my-sites" />;
const badge = <img src={ poweredByTitanLogo } alt={ translate( 'Powered by Titan' ) } />;
const getTitanFeatures = () => {
	return [
		translate( 'Inbox, calendars, and contacts' ),
		translate( '30GB storage' ),
		translate( '24/7 support via email' ),
	];
};

const professionalEmailFormattedPrice = (
	formattedPriceClassName: string,
	cost: number,
	currencyCode: string
) => {
	return translate( '{{price/}} /mailbox', {
		components: {
			price: (
				<span className={ formattedPriceClassName }>
					{ formatCurrency( cost ?? 0, currencyCode ) }
				</span>
			),
		},
		comment: '{{price/}} is the formatted price, e.g. $20',
	} );
};

const professionalEmailCardInformation: ProviderCard = {
	detailsExpanded: true,
	expandButtonLabel: translate( 'Expand' ),
	onExpandedChange: noop,
	providerKey: 'titan',
	showExpandButton: false,
	description: translate( 'Integrated email solution for your WordPress.com site.' ),
	logo,
	productName: getTitanProductName(),
	badge,
	features: getTitanFeatures(),
};

const ProfessionalEmailCard: FunctionComponent< EmailProvidersStackedCardProps > = ( props ) => {
	const { currencyCode = '', hasCartDomain, domain, selectedDomainName, titanMailProduct } = props;
	const professionalEmail = professionalEmailCardInformation;

	const isEligibleForFreeTrial = hasCartDomain || isDomainEligibleForTitanFreeTrial( domain );

	const isUpgrading = () => {
		const { domain, hasCartDomain } = props;

		return ! hasCartDomain && hasEmailForwards( domain );
	};

	const formattedPriceClassName = classNames( {
		'professional-email-card__keep-main-price': ! isEligibleForFreeTrial,
		'professional-email-card__discounted-price': isEligibleForFreeTrial,
	} );

	const expandButtonLabel = isUpgrading()
		? translate( 'Upgrade to %(titanProductName)s', {
				args: {
					titanProductName: getTitanProductName(),
				},
				comment:
					'%(titanProductName) is the name of the product, which should be "Professional Email" translated',
		  } )
		: translate( 'Add %(titanProductName)s', {
				args: {
					titanProductName: getTitanProductName(),
				},
				comment:
					'%(titanProductName) is the name of the product, which should be "Professional Email" translated',
		  } );

	const [ titanMailbox, setTitanMailbox ] = useState( [
		buildNewTitanMailbox( selectedDomainName, false ),
	] );
	const [ addingToCart, setAddingToCart ] = useState( false );
	const [ validatedTitanMailboxUuids, setValidatedTitanMailboxUuids ] = useState( [ '' ] );
	const optionalFields = [ TITAN_PASSWORD_RESET_FIELD, TITAN_FULL_NAME_FIELD ];

	const onTitanConfirmNewMailboxes = () => {
		const {
			comparisonContext,
			domain,
			hasCartDomain,
			recordTracksEventAddToCartClick = noop,
			source,
		} = props;

		const validatedTitanMailboxes = validateTitanMailboxes( titanMailbox, optionalFields );

		const mailboxesAreValid = areAllMailboxesValid( validatedTitanMailboxes, optionalFields );
		const userCanAddEmail = hasCartDomain || canCurrentUserAddEmail( domain );
		const userCannotAddEmailReason = userCanAddEmail
			? null
			: getCurrentUserCannotAddEmailReason( domain );

		const validatedMailboxUuids = validatedTitanMailboxes.map( ( mailbox ) => mailbox.uuid );
		recordTracksEventAddToCartClick(
			comparisonContext,
			validatedMailboxUuids,
			mailboxesAreValid,
			TITAN_PROVIDER_NAME,
			source,
			userCanAddEmail,
			userCannotAddEmailReason
		);

		setTitanMailbox( titanMailbox );
		setValidatedTitanMailboxUuids( validatedMailboxUuids );

		if ( ! mailboxesAreValid || ! userCanAddEmail ) {
			return;
		}

		const { productsList, selectedDomainName, selectedSite, shoppingCartManager } = props;

		const cartItem = titanMailMonthly( {
			domain: selectedDomainName,
			quantity: validatedTitanMailboxes.length,
			extra: {
				email_users: validatedTitanMailboxes.map( transformMailboxForCart ),
				new_quantity: validatedTitanMailboxes.length,
			},
		} );

		setAddingToCart( true );

		shoppingCartManager
			.addProductsToCart( [ fillInSingleCartItemAttributes( cartItem, productsList ) ] )
			.then( () => {
				setAddingToCart( false );
				const { errors } = props.cart?.messages;
				if ( errors && errors.length ) {
					// Stay on the page to show the relevant error(s)
					return;
				}

				page( '/checkout/' + selectedSite?.slug );
			} );
	};

	const onTitanFormReturnKeyPress = noop;

	const formattedPrice = professionalEmailFormattedPrice(
		formattedPriceClassName,
		titanMailProduct?.cost ?? 0,
		currencyCode
	);

	const priceBadge = (
		<>
			{ isDomainEligibleForTitanFreeTrial( domain ) && (
				<div className="professional-email-card__discount badge badge--info-green">
					{ translate( '3 months free' ) }
				</div>
			) }
			<PromoCardPrice
				formattedPrice={ formattedPrice }
				additionalPriceInformation={
					<span className="professional-email-card__provider-additional-price-information">
						{ professionalEmail.additionalPriceInformation }
					</span>
				}
			/>
		</>
	);

	const formFields = (
		<TitanNewMailboxList
			onMailboxesChange={ setTitanMailbox }
			mailboxes={ titanMailbox }
			selectedDomainName={ selectedDomainName }
			onReturnKeyPress={ onTitanFormReturnKeyPress }
			showLabels={ true }
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

	return (
		<EmailProvidersStackedCard
			providerKey={ professionalEmail.providerKey }
			logo={ professionalEmail.logo }
			priceBadge={ priceBadge }
			productName={ professionalEmail.productName }
			description={ professionalEmail.description }
			detailsExpanded={ professionalEmail.detailsExpanded }
			onExpandedChange={ professionalEmail.onExpandedChange }
			formFields={ formFields }
			isDomainEligibleForTitanFreeTrial={ isDomainEligibleForTitanFreeTrial( domain ) }
			showExpandButton={ professionalEmail.showExpandButton }
			expandButtonLabel={ expandButtonLabel }
			features={ professionalEmail.features }
			footerBadge={ professionalEmail.badge }
		/>
	);
};

export default connect( ( state, ownProps: EmailProvidersStackedCardProps ) => {
	const selectedSite = getSelectedSite( state );
	const domains = getDomainsBySiteId( state, selectedSite?.ID );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: ownProps.selectedDomainName,
	} );
	const resolvedDomainName = domain ? domain.name : ownProps.selectedDomainName;

	const hasCartDomain = Boolean( ownProps.cartDomainName );

	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
		domain,
		selectedDomainName: resolvedDomainName,
		hasCartDomain,
		productsList: getProductsList( state ),
		selectedSite,
		titanMailProduct: getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG ),
	};
} )( withCartKey( withShoppingCart( ProfessionalEmailCard ) ) );
