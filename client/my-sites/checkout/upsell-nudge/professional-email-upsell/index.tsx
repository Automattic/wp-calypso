import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { MOBILE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import poweredByTitanLogo from 'calypso/assets/images/email-providers/titan/powered-by-titan-caps.svg';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { titanMailMonthly, titanMailYearly } from 'calypso/lib/cart-values/cart-items';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import ProfessionalEmailPrice from 'calypso/my-sites/email/email-providers-comparison/price/professional-email';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import { NewMailBoxList } from 'calypso/my-sites/email/form/mailboxes/components/new-mailbox-list';
import { MailboxOperations } from 'calypso/my-sites/email/form/mailboxes/components/utilities/mailbox-operations';
import {
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_PASSWORD_RESET_EMAIL,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import { getProfessionalEmailCheckoutUpsellPath } from 'calypso/my-sites/email/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import MasterbarStyled from '../../checkout-thank-you/redesign-v2/masterbar-styled';
import ProfessionalEmailUpsellPlaceholder from './placeholder';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

const ProfessionalEmailFeature = ( { children }: { children: TranslateResult } ) => {
	return (
		<li>
			<Gridicon icon="checkmark" size={ 18 } />
			<span>{ children }</span>
		</li>
	);
};

const getCartItems = (
	mailboxes: MailboxForm< EmailProvider >[],
	selectedIntervalLength: IntervalLength
) => {
	const email_users = mailboxes.map( ( mailbox ) => mailbox.getAsCartItem() );

	const cartItemFunction =
		selectedIntervalLength === IntervalLength.MONTHLY ? titanMailMonthly : titanMailYearly;

	return cartItemFunction( {
		domain: mailboxes[ 0 ].formFields.domain.value,
		quantity: email_users.length,
		extra: {
			email_users,
			new_quantity: email_users.length,
		},
	} );
};

type ProfessionalEmailUpsellProps = {
	domainName: string;
	handleClickAccept: ( action: string ) => void;
	handleClickDecline: () => void;
	setCartItem: ( cartItem: MinimalRequestCartProduct, callback: () => void ) => void;
	intervalLength?: IntervalLength | undefined;
	isLoading?: boolean;
};

const ProfessionalEmailUpsell = ( {
	domainName,
	handleClickAccept,
	handleClickDecline,
	setCartItem,
	intervalLength = IntervalLength.ANNUALLY,
	isLoading = false,
}: ProfessionalEmailUpsellProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ selectedIntervalLength, setSelectedIntervalLength ] = useState( intervalLength );

	const selectedSite = useSelector( getSelectedSite );
	const isDomainOnlySite =
		selectedSite === null ? true : selectedSite?.options?.is_domain_only ?? false;

	const isMobileView = useBreakpoint( MOBILE_BREAKPOINT );

	const changeIntervalLength = ( newIntervalLength: IntervalLength ) => {
		setSelectedIntervalLength( newIntervalLength );
		dispatch(
			recordTracksEvent( 'calypso_professional_email_upsell_nudge_billing_interval_toggle_click', {
				domain_name: domainName,
				new_interval: newIntervalLength,
			} )
		);
	};

	const onSubmit = async ( mailboxOperations: MailboxOperations ) => {
		if ( ! ( await mailboxOperations.validateAndCheck( false ) ) ) {
			return;
		}

		setCartItem( getCartItems( mailboxOperations.mailboxes, selectedIntervalLength ), () =>
			handleClickAccept( 'accept' )
		);
	};

	const pricingComponent = (
		<div className="professional-email-upsell__pricing">
			<ProfessionalEmailPrice intervalLength={ selectedIntervalLength } isDomainInCart />
		</div>
	);

	return (
		<>
			<PageViewTracker
				path={ getProfessionalEmailCheckoutUpsellPath( ':site', ':domain', ':receiptId' ) }
				title="Post Checkout - Professional Email Upsell"
			/>

			<MasterbarStyled
				onClick={ () => page( `/home/${ selectedSite?.slug ?? '' }` ) }
				backText={ translate( 'Back to dashboard' ) }
				canGoBack={ !! selectedSite?.ID }
				showContact
			/>

			{ isLoading ? (
				<ProfessionalEmailUpsellPlaceholder />
			) : (
				<>
					<header className="professional-email-upsell__header">
						<h3 className="professional-email-upsell__small-title">
							{ isDomainOnlySite
								? translate( "Hold tight, we're getting your domain ready." )
								: translate( "Hold tight, we're getting your site ready." ) }
						</h3>
						<h1 className="professional-email-upsell__title wp-brand-font">
							{ translate( 'Add Professional Email @%(domain)s', {
								args: {
									domain: domainName,
								},
								comment: '%(domain)s is a domain name, like example.com',
							} ) }
						</h1>
						<h3 className="professional-email-upsell__small-subtitle">
							{ translate( 'No setup required. Easy to manage.' ) }
						</h3>
						<BillingIntervalToggle
							intervalLength={ selectedIntervalLength }
							onIntervalChange={ changeIntervalLength }
						/>
					</header>

					<div className="professional-email-upsell__content">
						{ isMobileView && pricingComponent }

						<div className="professional-email-upsell__form">
							<NewMailBoxList
								cancelActionText={ translate( 'Skip for now' ) }
								fieldLabelTexts={ {
									[ FIELD_MAILBOX ]: translate( 'Enter email address' ),
									[ FIELD_PASSWORD ]: translate( 'Set password' ),
								} }
								hiddenFieldNames={ [ FIELD_NAME, FIELD_PASSWORD_RESET_EMAIL ] }
								isInitialMailboxPurchase
								onCancel={ handleClickDecline }
								onSubmit={ onSubmit }
								provider={ EmailProvider.Titan }
								selectedDomainName={ domainName }
								showCancelButton
								submitActionText={ translate( 'Add Professional Email' ) }
							/>
						</div>

						<div className="professional-email-upsell__features">
							{ ! isMobileView && pricingComponent }

							<h2>{ translate( 'Why get Professional Email?' ) }</h2>
							<ul className="professional-email-upsell__feature-list">
								<ProfessionalEmailFeature>
									{ translate( "Trusted email address that's truly yours" ) }
								</ProfessionalEmailFeature>
								<ProfessionalEmailFeature>
									{ translate( 'Increase your credibility' ) }
								</ProfessionalEmailFeature>
								<ProfessionalEmailFeature>
									{ translate( 'Build your brand with every email you send' ) }
								</ProfessionalEmailFeature>
								<ProfessionalEmailFeature>
									{ translate( 'Reach your recipients’ primary inbox' ) }
								</ProfessionalEmailFeature>
							</ul>

							<img
								className="professional-email-upsell__titan-logo"
								src={ poweredByTitanLogo }
								alt={ translate( 'Powered by Titan', { textOnly: true } ) }
							/>
						</div>
					</div>
				</>
			) }
		</>
	);
};

export default ProfessionalEmailUpsell;
