import { GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY } from '@automattic/calypso-products';
import { withShoppingCart } from '@automattic/shopping-cart';
import { translate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';
import { connect } from 'react-redux';
import googleWorkspaceIcon from 'calypso/assets/images/email-providers/google-workspace/icon.svg';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import GSuiteNewUserList from 'calypso/components/gsuite/gsuite-new-user-list';
import { hasDiscount } from 'calypso/components/gsuite/gsuite-price';
import InfoPopover from 'calypso/components/info-popover';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { getAnnualPrice, getGoogleMailServiceFamily, getMonthlyPrice } from 'calypso/lib/gsuite';
import { newUsers } from 'calypso/lib/gsuite/new-users';
import withCartKey from 'calypso/my-sites/checkout/with-cart-key';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import {
	EmailProvidersStackedCardProps,
	ProviderCard,
} from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/provider-card-props';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug, getProductsList } from 'calypso/state/products-list/selectors';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './google-workspace-card.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const identityMap = ( item: any ) => item;

const getGoogleFeatures = () => {
	return [
		translate( 'Annual billing' ),
		translate( 'Send and receive from your custom domain' ),
		translate( '30GB storage' ),
		translate( 'Email, calendars, and contacts' ),
		translate( 'Video calls, docs, spreadsheets, and more' ),
		translate( 'Work from anywhere on any device – even offline' ),
	];
};

const formattedPrice = (
	productIsDiscounted: boolean,
	monthlyPrice: string,
	saleCost: number,
	currencyCode: string
) => {
	return productIsDiscounted
		? translate( '{{fullPrice/}} {{discountedPrice/}} /mailbox /month (billed annually)', {
				components: {
					fullPrice: <span>{ monthlyPrice }</span>,
					discountedPrice: (
						<span className="google-workspace-card__discounted-price">
							{ getMonthlyPrice( saleCost, currencyCode ) }
						</span>
					),
				},
				comment:
					'{{fullPrice/}} is the formatted full price, e.g. $20; {{discountedPrice/}} is the discounted, formatted price, e.g. $10',
		  } )
		: translate( '{{price/}} /mailbox /month billed annually', {
				components: {
					price: <span>{ monthlyPrice }</span>,
				},
				comment: '{{price/}} is the formatted price, e.g. $20',
		  } );
};

const googleWorkspaceCardInformation: ProviderCard = {
	detailsExpanded: true,
	expandButtonLabel: translate( 'Expand' ),
	onExpandedChange: noop,
	providerKey: 'google',
	showExpandButton: true,
	description: translate(
		'Professional email integrated with Google Meet and other productivity tools from Google.'
	),
	logo: { path: googleWorkspaceIcon },
	productName: getGoogleMailServiceFamily(),
	features: getGoogleFeatures(),
};

const GoogleWorkspaceCard: FunctionComponent< EmailProvidersStackedCardProps > = ( props ) => {
	const { currencyCode = '', domain, gSuiteProduct, selectedDomainName } = props;
	const googleWorkspace: ProviderCard = googleWorkspaceCardInformation;

	const isUpgrading = () => {
		const { domain, hasCartDomain } = props;

		return ! hasCartDomain && hasEmailForwards( domain );
	};

	const productIsDiscounted = hasDiscount( gSuiteProduct );
	//const monthlyPrice = getMonthlyPrice( gSuiteProduct?.cost ?? null, currencyCode );
	const standardPrice = getAnnualPrice( gSuiteProduct?.cost ?? null, currencyCode );

	const expandButtonLabel = isUpgrading()
		? translate( 'Upgrade to %(googleMailService)s', {
				args: {
					googleMailService: getGoogleMailServiceFamily(),
				},
				comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
		  } )
		: translate( 'Add %(googleMailService)s', {
				args: {
					googleMailService: getGoogleMailServiceFamily(),
				},
				comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
		  } );

	const discount = productIsDiscounted ? (
		<span className="google-workspace-card__discount-with-renewal">
			{ translate(
				'%(discount)d% off{{span}}, %(discountedPrice)s billed today, renews at %(standardPrice)s{{/span}}',
				{
					args: {
						discount: gSuiteProduct.sale_coupon.discount,
						discountedPrice: getAnnualPrice( gSuiteProduct.sale_cost, currencyCode ),
						standardPrice,
					},
					comment:
						'%(discount)d is a numeric discount percentage, e.g. 40; ' +
						'%(discountedPrice)s is a formatted, discounted price that the user will pay today, e.g. $3; ' +
						'%(standardPrice)s is a formatted price, e.g. $5',
					components: {
						span: <span />,
					},
				}
			) }

			<InfoPopover position="right" showOnHover>
				{ translate(
					'This discount is only available the first time you purchase a %(googleMailService)s account, any additional mailboxes purchased after that will be at the regular price.',
					{
						args: {
							googleMailService: getGoogleMailServiceFamily(),
						},
						comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
					}
				) }
			</InfoPopover>
		</span>
	) : null;

	const onGoogleConfirmNewMailboxes = noop;
	const onGoogleUsersChange = noop;
	const onGoogleFormReturnKeyPress = noop;

	const domainList = domain ? [ domain ] : null;

	const formFields = (
		<FormFieldset>
			<GSuiteNewUserList
				extraValidation={ identityMap }
				domains={ domainList }
				onUsersChange={ onGoogleUsersChange }
				selectedDomainName={ selectedDomainName }
				users={ newUsers( selectedDomainName ) }
				onReturnKeyPress={ onGoogleFormReturnKeyPress }
				showAddAnotherMailboxButton={ false }
			>
				<FullWidthButton
					className="google-workspace-card__continue"
					primary
					busy={ false }
					onClick={ onGoogleConfirmNewMailboxes }
				>
					{ translate( 'Create your mailbox' ) }
				</FullWidthButton>
			</GSuiteNewUserList>
		</FormFieldset>
	);

	return (
		<EmailProvidersStackedCard
			providerKey={ googleWorkspace.providerKey }
			logo={ googleWorkspace.logo }
			productName={ googleWorkspace.productName }
			description={ googleWorkspace.description }
			detailsExpanded={ googleWorkspace.detailsExpanded }
			discount={ discount }
			additionalPriceInformation={ googleWorkspace.additionalPriceInformation }
			onExpandedChange={ googleWorkspace.onExpandedChange }
			formattedPrice={ formattedPrice(
				productIsDiscounted,
				getMonthlyPrice( gSuiteProduct.cost, currencyCode ),
				gSuiteProduct?.sale_cost,
				currencyCode
			) }
			formFields={ formFields }
			isDomainEligibleForTitanFreeTrial={ false }
			showExpandButton={ googleWorkspace.showExpandButton }
			expandButtonLabel={ expandButtonLabel }
			features={ googleWorkspace.features }
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
		domainName: resolvedDomainName,
		hasCartDomain,
		productsList: getProductsList( state ),
		selectedSite,
		gSuiteProduct: getProductBySlug( state, GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY ),
	};
} )( withCartKey( withShoppingCart( GoogleWorkspaceCard ) ) );
