import { Gridicon } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { translate, useTranslate } from 'i18n-calypso';
import { MouseEvent, useState } from 'react';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getTitanProductName } from 'calypso/lib/titan';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import ProfessionalEmailPrice from 'calypso/my-sites/email/email-providers-comparison/price/professional-email';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-comparison/stacked/email-provider-stacked-card';
import getOnSubmitNewMailboxesHandler from 'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/get-on-submit-new-mailboxes-handler';
import getUpsellProps from 'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/get-upsell-props';
import { getProductByProviderAndInterval } from 'calypso/my-sites/email/email-providers-comparison/stacked/provider-cards/selectors/get-product-by-provider-and-interval';
import {
	HiddenFieldNames,
	NewMailBoxList,
} from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';
import PasswordResetTipField from 'calypso/my-sites/email/form/mailboxes/components/password-reset-tip-field';
import {
	FIELD_NAME,
	FIELD_PASSWORD_RESET_EMAIL,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { usePasswordResetEmailField } from 'calypso/my-sites/email/hooks/use-password-reset-email-field';
import { useDispatch, useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { EmailProvidersStackedCardProps, ProviderCardProps } from './provider-card-props';

import './professional-email-card.scss';

const logo = (
	<Gridicon className="professional-email-card__logo" icon="my-sites" aria-hidden="true" />
);
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
	get expandButtonLabel() {
		return translate( 'Select' );
	},
	providerKey: 'titan',
	showExpandButton: true,
	get description() {
		return translate(
			'Integrated email solution with powerful features. Manage your email and more on any device.'
		);
	},
	logo,
	get productName() {
		return getTitanProductName();
	},
	footerBadge: badge,
	get features() {
		return getTitanFeatures();
	},
};

const ProfessionalEmailCard = ( props: EmailProvidersStackedCardProps ) => {
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
	const currentRoute = useSelector( getCurrentRoute );

	const provider = EmailProvider.Titan;
	const emailProduct = useSelector( ( state ) =>
		getProductByProviderAndInterval( state, provider, intervalLength )
	);

	const cartKey = useCartKey();
	const dispatch = useDispatch();
	const shoppingCartManager = useShoppingCart( cartKey );
	const [ addingToCart, setAddingToCart ] = useState( false );
	const defaultHiddenFields: HiddenFieldNames[] = [ FIELD_NAME ];

	const { hiddenFields, initialValue: passwordResetEmailFieldInitialValue } =
		usePasswordResetEmailField( {
			selectedDomainName,
			defaultHiddenFields,
		} );

	const [ hiddenFieldNames, setHiddenFieldNames ] = useState< HiddenFieldNames[] >( hiddenFields );

	const showPasswordResetEmailField = ( event: MouseEvent< HTMLElement > ) => {
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
		currentRoute,
	} );

	professionalEmail.formFields = (
		<NewMailBoxList
			areButtonsBusy={ addingToCart }
			hiddenFieldNames={ hiddenFieldNames }
			initialFieldValues={ {
				[ FIELD_PASSWORD_RESET_EMAIL ]: passwordResetEmailFieldInitialValue,
			} }
			isInitialMailboxPurchase
			onSubmit={ handleSubmit }
			provider={ provider }
			selectedDomainName={ selectedDomainName }
			showAddNewMailboxButton
			submitActionText={ translate( 'Purchase' ) }
			{ ...getUpsellProps( { isDomainInCart, siteSlug } ) }
		>
			{ hiddenFieldNames.includes( FIELD_PASSWORD_RESET_EMAIL ) && (
				<PasswordResetTipField tipClickHandler={ showPasswordResetEmailField } />
			) }
		</NewMailBoxList>
	);

	return <EmailProvidersStackedCard { ...professionalEmail } />;
};

export default ProfessionalEmailCard;
