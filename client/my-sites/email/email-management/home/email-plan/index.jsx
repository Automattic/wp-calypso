import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import titleCase from 'to-title-case';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import HeaderCake from 'calypso/components/header-cake';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { useIsLoading as useAddEmailForwardMutationIsLoading } from 'calypso/data/emails/use-add-email-forward-mutation';
import { useGetEmailAccountsQuery } from 'calypso/data/emails/use-get-email-accounts-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { canAddMailboxesToEmailSubscription } from 'calypso/lib/emails';
import {
	getGoogleAdminUrl,
	getGoogleMailServiceFamily,
	getGSuiteProductSlug,
	getProductType,
	hasGSuiteWithUs,
} from 'calypso/lib/gsuite';
import { handleRenewNowClick, isExpired } from 'calypso/lib/purchases';
import {
	getTitanProductName,
	getTitanSubscriptionId,
	hasTitanMailWithUs,
	isDomainEligibleForTitanIntroductoryOffer,
} from 'calypso/lib/titan';
import { TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL } from 'calypso/lib/titan/constants';
import { EmailPlanHeader } from 'calypso/my-sites/email/email-management/home/email-plan-header';
import EmailPlanMailboxesList from 'calypso/my-sites/email/email-management/home/email-plan-mailboxes-list';
import MailPoetUpsell from 'calypso/my-sites/email/email-management/home/mailpoet-upsell';
import {
	getEmailPurchaseByDomain,
	hasEmailSubscription,
} from 'calypso/my-sites/email/email-management/home/utils';
import {
	getEmailManagementPath,
	getAddEmailForwardsPath,
	getAddGSuiteUsersPath,
	getManageTitanAccountPath,
	getManageTitanMailboxesPath,
	getNewTitanAccountPath,
	getPurchaseNewEmailAccountPath,
	getTitanControlPanelRedirectPath,
} from 'calypso/my-sites/email/paths';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { useDispatch, useSelector } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import {
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

import './style.scss';

const UpgradeNavItem = ( { currentRoute, domain, selectedSiteSlug } ) => {
	const translate = useTranslate();

	if ( hasGSuiteWithUs( domain ) || hasTitanMailWithUs( domain ) ) {
		return null;
	}

	return (
		<VerticalNavItem
			path={ getPurchaseNewEmailAccountPath( selectedSiteSlug, domain.name, currentRoute ) }
			onClick={ () => recordTracksEvent( 'calypso_upsell_email', { context: 'email-forwarding' } ) }
		>
			{ translate( 'Upgrade to Professional Email' ) }
			{ isDomainEligibleForTitanIntroductoryOffer( domain ) && (
				<Badge type="info-green">{ translate( 'Try 3 months free' ) }</Badge>
			) }
		</VerticalNavItem>
	);
};

UpgradeNavItem.propTypes = {
	currentRoute: PropTypes.string,
	domain: PropTypes.object.isRequired,
	selectedSiteSlug: PropTypes.string.isRequired,
};

function getAccount( accounts ) {
	return accounts?.[ 0 ];
}

function getEmailForwardLimit( data ) {
	return data?.[ 0 ]?.maximum_mailboxes || 0;
}

function getMailboxes( data ) {
	const account = getAccount( data );

	return account?.emails ?? [];
}

function EmailPlan( {
	domain,
	selectedSite,
	source,
	context,
	hideHeader = false,
	hideHeaderCake = false,
	hidePlanActions = false,
	hideMailPoetUpsell = false,
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const purchase = useSelector( ( state ) => getEmailPurchaseByDomain( state, domain ) );
	const isLoadingPurchase = useSelector(
		( state ) => isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state )
	);
	const currentRoute = useSelector( getCurrentRoute );
	const canAddMailboxes = canAddMailboxesToEmailSubscription( domain );
	const hasSubscription = hasEmailSubscription( domain );

	const handleBack = () => {
		page( getEmailManagementPath( selectedSite.slug ) );
	};

	const handleRenew = ( event ) => {
		event.preventDefault();

		dispatch(
			handleRenewNowClick( purchase, selectedSite.slug, {
				tracksProps: { source: 'email-plan-view' },
			} )
		);
	};

	const addEmailForwardMutationActive = useAddEmailForwardMutationIsLoading();

	const {
		data: emailAccounts = [],
		isLoading: isLoadingEmailAccounts,
		refetch,
	} = useGetEmailAccountsQuery( selectedSite.ID, domain.name, {
		refetchOnMount: ! addEmailForwardMutationActive,
		retry: false,
	} );

	// Email checkout provides the /mailbox route with a new email param, e.g. /mailboxes/example.com?new-email=example@example.com
	const queryParams = new URLSearchParams( window.location.search );
	const newEmail = queryParams.get( 'new-email' );

	useEffect( () => {
		if ( ! newEmail ) {
			return;
		}
		dispatch(
			successNotice(
				translate( 'Your mailbox %(mailbox)s has been created.', { args: { mailbox: newEmail } } ),
				{
					duration: 8000,
				}
			)
		);
	}, [ newEmail, dispatch, translate ] );

	const mailbox = newEmail ? newEmail.split( '@' )[ 0 ] : '';
	const emailExists = emailAccounts.some( ( account ) =>
		account.emails.some( ( email ) => mailbox === email.mailbox )
	);

	const [ emailAccountsRefetchCount, setEmailAccountsRefetchCount ] = useState( 0 );
	const isLoading =
		isLoadingEmailAccounts || ( newEmail && ! emailExists && emailAccountsRefetchCount < 5 );

	// Email provisioning takes a few seconds to complete, if there is a newEmail
	// Refetch email acounts every 1.5 seconds up to 5 times until we can see it
	useEffect( () => {
		if ( ! newEmail || emailExists || emailAccountsRefetchCount >= 5 ) {
			return;
		}

		const refetchTimeout = setTimeout( () => {
			refetch();
			setEmailAccountsRefetchCount( ( prev ) => prev + 1 );
		}, 1500 );

		return () => clearTimeout( refetchTimeout );
	}, [ newEmail, refetch, emailExists, emailAccountsRefetchCount ] );

	const emailForwardsLimit = getEmailForwardLimit( emailAccounts );

	function getAddMailboxProps() {
		if ( hasGSuiteWithUs( domain ) ) {
			return {
				disabled: ! canAddMailboxes,
				path: getAddGSuiteUsersPath(
					selectedSite.slug,
					domain.name,
					getProductType( getGSuiteProductSlug( domain ) ),
					currentRoute,
					source
				),
			};
		}

		if ( hasTitanMailWithUs( domain ) ) {
			if ( getTitanSubscriptionId( domain ) ) {
				return {
					disabled: ! canAddMailboxes,
					path: getNewTitanAccountPath( selectedSite.slug, domain.name, currentRoute, {
						source,
					} ),
				};
			}

			const showExternalControlPanelLink = ! config.isEnabled( 'titan/iframe-control-panel' );
			const controlPanelUrl = showExternalControlPanelLink
				? getTitanControlPanelRedirectPath( selectedSite.slug, domain.name, currentRoute, {
						context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
				  } )
				: getManageTitanAccountPath( selectedSite.slug, domain.name, currentRoute, {
						context: TITAN_CONTROL_PANEL_CONTEXT_CREATE_EMAIL,
				  } );

			return {
				external: showExternalControlPanelLink,
				path: controlPanelUrl,
			};
		}

		// All site admins are allowed to add/remove email forwards
		return {
			path: getAddEmailForwardsPath( selectedSite.slug, domain.name, currentRoute ),
		};
	}

	function getHeaderText() {
		if ( hasGSuiteWithUs( domain ) ) {
			const googleMailService = getGoogleMailServiceFamily( getGSuiteProductSlug( domain ) );

			return translate( '%(googleMailService)s settings', {
				args: {
					googleMailService,
				},
				comment: '%(googleMailService)s can be either "GSuite" or "Google Workspace"',
			} );
		}

		if ( hasTitanMailWithUs( domain ) ) {
			return translate( '%(titanProductName)s settings', {
				args: {
					titanProductName: getTitanProductName(),
				},
				comment:
					'%(titanProductName) is the name of the product, which should be "Professional Email" translated',
			} );
		}

		return translate( 'Email forwarding settings' );
	}

	function renderViewBillingAndPaymentSettingsNavItem() {
		const managePurchaseUrl = purchase
			? getManagePurchaseUrlFor( selectedSite.slug, purchase.id )
			: '';

		if ( ! hasSubscription || ! purchase ) {
			return null;
		}

		return (
			<VerticalNavItem path={ managePurchaseUrl }>
				{ translate( 'View billing and payment settings' ) }
			</VerticalNavItem>
		);
	}

	function getManageAllNavItemProps() {
		if ( hasGSuiteWithUs( domain ) ) {
			return {
				external: true,
				path: getGoogleAdminUrl( domain.name ),
			};
		}

		if ( hasTitanMailWithUs( domain ) ) {
			if ( config.isEnabled( 'titan/iframe-control-panel' ) ) {
				return {
					path: getManageTitanAccountPath( selectedSite.slug, domain.name, currentRoute ),
				};
			}

			return {
				path: getManageTitanMailboxesPath( selectedSite.slug, domain.name, currentRoute ),
			};
		}

		return null;
	}

	function renderManageAllMailboxesNavItem() {
		const manageAllNavItemProps = getManageAllNavItemProps();

		if ( manageAllNavItemProps === null ) {
			return null;
		}

		return (
			<VerticalNavItem { ...manageAllNavItemProps } disabled={ ! purchase }>
				{ translate( 'Manage all mailboxes', {
					comment:
						'This is the text for a link to manage all email accounts/mailboxes for a subscription',
				} ) }
			</VerticalNavItem>
		);
	}

	function renderAddNewMailboxesOrRenewNavItem( mailboxes ) {
		if ( hasTitanMailWithUs( domain ) || hasGSuiteWithUs( domain ) ) {
			if ( purchase && isExpired( purchase ) ) {
				return (
					<VerticalNavItem onClick={ handleRenew } path="#">
						{ translate( 'Renew to add new mailboxes' ) }
					</VerticalNavItem>
				);
			}

			return (
				<VerticalNavItem { ...getAddMailboxProps() }>
					{ translate( 'Add new mailboxes' ) }
				</VerticalNavItem>
			);
		}

		const isAtEmailForwardsLimit = mailboxes.length >= emailForwardsLimit;

		return (
			<VerticalNavItem { ...getAddMailboxProps() } disabled={ isAtEmailForwardsLimit }>
				{ isAtEmailForwardsLimit
					? translate( 'Using %1$s of %1$s email forwards', {
							args: [ emailForwardsLimit ],
					  } )
					: translate( 'Add new email forwards' ) }
			</VerticalNavItem>
		);
	}

	return (
		<>
			{ selectedSite && hasSubscription && <QuerySitePurchases siteId={ selectedSite.ID } /> }
			<DocumentHead title={ titleCase( getHeaderText() ) } />
			{ ! hideMailPoetUpsell && <MailPoetUpsell /> }
			{ ! hideHeaderCake && <HeaderCake onClick={ handleBack }>{ getHeaderText() }</HeaderCake> }
			{ ! hideHeader && (
				<EmailPlanHeader
					domain={ domain }
					hasEmailSubscription={ hasSubscription }
					isLoadingEmails={ isLoading }
					isLoadingPurchase={ isLoadingPurchase }
					purchase={ purchase }
					selectedSite={ selectedSite }
					emailAccount={ getAccount( emailAccounts ) }
				/>
			) }
			<EmailPlanMailboxesList
				context={ context }
				account={ getAccount( emailAccounts ) }
				domain={ domain }
				mailboxes={ getMailboxes( emailAccounts ) }
				isLoadingEmails={ isLoading }
				actionPathProps={ hidePlanActions && getAddMailboxProps() }
				purchaseNewEmailAccountPath={ getPurchaseNewEmailAccountPath(
					selectedSite.slug,
					domain.name,
					currentRoute
				) }
			/>
			{ ! hidePlanActions && (
				<div className="email-plan__actions">
					<VerticalNav>
						{ renderAddNewMailboxesOrRenewNavItem( getMailboxes( emailAccounts ) ) }
						<UpgradeNavItem
							currentRoute={ currentRoute }
							domain={ domain }
							selectedSiteSlug={ selectedSite.slug }
						/>
						{ renderManageAllMailboxesNavItem() }
						{ renderViewBillingAndPaymentSettingsNavItem() }
					</VerticalNav>
				</div>
			) }
		</>
	);
}

EmailPlan.propTypes = {
	domain: PropTypes.object.isRequired,
	selectedSite: PropTypes.object.isRequired,
	source: PropTypes.string,
	context: PropTypes.string,
	hideHeader: PropTypes.bool,
	hideHeaderCake: PropTypes.bool,
	hidePlanActions: PropTypes.bool,
	hideMailPoetUpsell: PropTypes.bool,
};

export default EmailPlan;
