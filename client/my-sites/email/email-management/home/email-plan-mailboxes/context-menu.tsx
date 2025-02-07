import { isDesktop } from '@automattic/viewport';
import {
	Icon,
	desktop,
	mobile,
	cloudUpload,
	payment,
	settings,
	login,
	moreVertical,
} from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getGoogleAdminUrl, hasGSuiteWithUs } from 'calypso/lib/gsuite';
import {
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_CATCH_ALL_EMAIL,
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_DESKTOP_APP,
	TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_INTERNAL_FORWARDING,
	TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP,
	TITAN_CONTROL_PANEL_CONTEXT_IMPORT_EMAIL_DATA,
} from 'calypso/lib/titan/constants';
import { getTitanControlPanelRedirectPath } from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';

import './context-menu.scss';

const CONTEXT_VIEW_BILLING_PAYMENTS = 'view_billing_payments';
const CONTEXT_GOOGLE_WORKSPACE = 'google_workspace';

type Props = {
	className?: string;
	domain?: ResponseDomain;
};
export default function ContextMenu( { className, domain }: Props ) {
	const translate = useTranslate();
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const disableItem = ! isDesktop();

	/**
	 * Options
	 */
	const viewBillingPaymentsOption = {
		context: CONTEXT_VIEW_BILLING_PAYMENTS,
		icon: <Icon icon={ payment } />,
		label: translate( 'View billing and payments' ),
	};

	const manageTitanOptions = [
		{
			context: TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_DESKTOP_APP,
			icon: <Icon icon={ desktop } />,
			label: translate( 'Configure desktop app' ),
			disabled: disableItem,
			isExternalLink: true,
		},
		{
			context: TITAN_CONTROL_PANEL_CONTEXT_GET_MOBILE_APP,
			icon: <Icon icon={ mobile } />,
			label: translate( 'Get mobile app' ),
			isExternalLink: true,
		},
		{
			context: TITAN_CONTROL_PANEL_CONTEXT_IMPORT_EMAIL_DATA,
			icon: <Icon icon={ cloudUpload } />,
			label: translate( 'Import email data' ),
			disabled: disableItem,
			isExternalLink: true,
		},
		{
			context: TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_CATCH_ALL_EMAIL,
			icon: <Icon icon={ settings } />,
			label: translate( 'Configure catch-all email' ),
			disabled: disableItem,
			isExternalLink: true,
		},
		{
			context: TITAN_CONTROL_PANEL_CONTEXT_CONFIGURE_INTERNAL_FORWARDING,
			icon: <Icon icon={ login } />,
			label: translate( 'Set up internal forwarding' ),
			disabled: disableItem,
			isExternalLink: true,
		},
		viewBillingPaymentsOption,
	];

	const manageGoogleOptions = [
		{
			context: CONTEXT_GOOGLE_WORKSPACE,
			icon: <Icon icon={ settings } />,
			label: translate( 'Manage Google Workspace' ),
			isExternalLink: true,
		},
		viewBillingPaymentsOption,
	];

	const contextMenuOptions = hasGSuiteWithUs( domain ) ? manageGoogleOptions : manageTitanOptions;

	/**
	 * Callbacks
	 */
	const onClick = useCallback( ( context: string ) => {
		recordTracksEvent( 'calypso_email_management_titan_manage_mailboxes_link_click', {
			context: context,
		} );
	}, [] );

	const getPath = useCallback(
		( context: string ) => {
			if ( ! domain ) {
				return '';
			}

			switch ( context ) {
				case CONTEXT_VIEW_BILLING_PAYMENTS:
					return `/purchases/subscriptions/${ domain.name }/${ selectedSiteId }`;

				case CONTEXT_GOOGLE_WORKSPACE:
					return getGoogleAdminUrl( domain.name );

				default:
					return getTitanControlPanelRedirectPath( selectedSiteSlug, domain.name, currentRoute, {
						context,
					} );
			}
		},
		[ currentRoute, domain, selectedSiteId, selectedSiteSlug ]
	);

	/**
	 * Template render
	 */
	return (
		<EllipsisMenu
			className={ className }
			popoverClassName={ `${ className }-popover` }
			position="bottom"
			icon={ <Icon icon={ moreVertical } /> }
		>
			{ contextMenuOptions.map( ( option, key ) => (
				<PopoverMenuItem
					key={ key }
					{ ...option }
					onClick={ onClick }
					href={ getPath( option.context ) }
				>
					<span className="label">{ option.label }</span>
				</PopoverMenuItem>
			) ) }
		</EllipsisMenu>
	);
}
