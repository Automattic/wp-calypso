import { Button, Gridicon } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { translate, useTranslate } from 'i18n-calypso';
import { MouseEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getTitanProductName, getTitanProductSlug } from 'calypso/lib/titan';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import ProfessionalEmailPrice from 'calypso/my-sites/email/email-providers-comparison/price/professional-email';
import EmailProvidersStackedCard from 'calypso/my-sites/email/email-providers-stacked-comparison/email-provider-stacked-card';
import getOnSubmitNewMailboxesHandler from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/get-on-submit-new-mailboxes-handler';
import {
	HiddenFieldNames,
	NewMailBoxList,
} from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_NAME,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
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

const PasswordResetTipField = ( {
	userEmail,
	showAlternateEmailField,
	hiddenFieldNames,
}: {
	hiddenFieldNames: string[];
	showAlternateEmailField: ( event: MouseEvent< HTMLElement > ) => void;
	userEmail: string;
} ) => {
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

const ProfessionalEmailCard = ( props: EmailProvidersStackedCardProps ): ReactElement => {
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

	professionalEmail.formFields = (
		<NewMailBoxList
			areButtonsBusy={ addingToCart }
			hiddenFieldNames={ hiddenFieldNames }
			initialFieldValues={ { [ FIELD_ALTERNATIVE_EMAIL ]: userEmail } }
			isInitialMailboxPurchase
			onSubmit={ handleSubmit }
			provider={ provider }
			selectedDomainName={ selectedDomainName }
			showAddNewMailboxButton
			submitActionText={ translate( 'Purchase' ) }
		>
			<PasswordResetTipField
				hiddenFieldNames={ hiddenFieldNames }
				showAlternateEmailField={ showAlternateEmailField }
				userEmail={ userEmail }
			/>
		</NewMailBoxList>
	);

	return <EmailProvidersStackedCard { ...professionalEmail } />;
};

export default ProfessionalEmailCard;
