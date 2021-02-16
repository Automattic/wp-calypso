/**
 * External dependencies
 */
import page from 'page';
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, CompactCard } from '@automattic/components';
import { canUserPurchaseGSuite } from 'calypso/lib/gsuite';
import config from '@automattic/calypso-config';
import CustomEmailPromo from 'calypso/my-sites/email/email-providers-comparison/custom-email-promo';
import {
	emailManagementNewGSuiteAccount,
	emailManagementNewTitanAccount,
} from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getCurrentUserCurrencyCode } from 'calypso/state/current-user/selectors';
import { getProductBySlug } from 'calypso/state/products-list/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	GSUITE_BASIC_SLUG,
} from 'calypso/lib/gsuite/constants';
import GSuiteProviderDetails from 'calypso/my-sites/email/email-providers-comparison/gsuite-provider-details';
import HeaderCake from 'calypso/components/header-cake';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { TITAN_MAIL_MONTHLY_SLUG } from 'calypso/lib/titan/constants';
import TitanProviderDetails from 'calypso/my-sites/email/email-providers-comparison/titan-provider-details';

/**
 * Style dependencies
 */
import './style.scss';

export default function EmailProvidersUpsell( { domain } ) {
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	const handleGoBack = () => {
		page( `/domains/add/${ selectedSiteSlug }` );
	};

	const trackAddClick = ( provider ) => {
		recordTracksEvent( 'calypso_email_upsell_add_click', { provider } );
	};

	const handleSkipClick = ( skipPosition ) => {
		recordTracksEvent( 'calypso_email_upsell_skip_click', { skip_position: skipPosition } );

		page( `/checkout/${ selectedSiteSlug }` );
	};

	const onAddGSuiteClick = () => {
		trackAddClick( 'google' );

		const planType = config.isEnabled( 'google-workspace-migration' ) ? 'starter' : 'basic';

		page( emailManagementNewGSuiteAccount( selectedSiteSlug, domain, planType, currentRoute ) );
	};

	const onAddTitanClick = () => {
		trackAddClick( 'titan' );

		page( emailManagementNewTitanAccount( selectedSiteSlug, domain, currentRoute ) );
	};

	const showGSuite = canUserPurchaseGSuite();
	const titanCardClassName = showGSuite ? null : 'no-gsuite';
	const currencyCode = useSelector( getCurrentUserCurrencyCode );

	const gSuiteProductSlug = config.isEnabled( 'google-workspace-migration' )
		? GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
		: GSUITE_BASIC_SLUG;

	const gSuiteProduct = useSelector( ( state ) => getProductBySlug( state, gSuiteProductSlug ) );
	const titanMailProduct = useSelector( ( state ) =>
		getProductBySlug( state, TITAN_MAIL_MONTHLY_SLUG )
	);

	return (
		<React.Fragment>
			<HeaderCake onClick={ handleGoBack }>
				{ translate( 'Register %(domain)s', { args: { domain } } ) }
			</HeaderCake>

			<CustomEmailPromo domainName={ domain } />
			<div className="email-providers-upsell__providers">
				<TitanProviderDetails
					className={ titanCardClassName }
					currencyCode={ currencyCode }
					onAddTitanClick={ onAddTitanClick }
					titanMailProduct={ titanMailProduct }
				/>
				{ showGSuite && (
					<GSuiteProviderDetails
						currencyCode={ currencyCode }
						gSuiteProduct={ gSuiteProduct }
						onAddGSuiteClick={ onAddGSuiteClick }
					/>
				) }
			</div>
			<CompactCard className="email-providers-upsell__actions">
				<Button onClick={ () => handleSkipClick( 'after_providers' ) }>
					{ translate( 'Skip for now' ) }
				</Button>
			</CompactCard>
		</React.Fragment>
	);
}
