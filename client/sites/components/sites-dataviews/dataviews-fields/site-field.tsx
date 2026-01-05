import * as React from 'react';
import { NameRenderer } from 'calypso/dashboard/sites/site-fields';
import { navigate } from 'calypso/lib/navigate';
import {
	isP2Site as getIsP2Site,
	isStagingSite,
	isSitePreviewPaneEligible as getIsSitePreviewPaneEligible,
	getSiteDisplayName,
} from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import { isTrialSite } from 'calypso/state/sites/plans/selectors';
import type { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
	sitePreviewPane: {
		open: (
			site: SiteExcerptData,
			source: 'site_field' | 'action' | 'list_row_click' | 'environment_switcher',
			openInNewTab?: boolean
		) => void;
		getUrl: ( site: SiteExcerptData ) => string;
	};
};

/**
 * Renders an anchor element that can trigger analytics calls
 * or client-side router navigation via the `onNavigate` prop.
 */
const Link = ( {
	disabled,
	href,
	onNavigate,
	...props
}: {
	/** Accessibly disable the link. Use sparingly. */
	disabled?: boolean;
	/** Called when the user wants to navigate to the link. */
	onNavigate?: ( shouldOpenNewTab: boolean, event: React.MouseEvent ) => void;
} & Omit< React.ComponentProps< 'a' >, 'aria-disabled' | 'role' | 'onClick' | 'onAuxClick' > ) => {
	const handleClick = ( event: React.MouseEvent ) => {
		if ( ! onNavigate || disabled ) {
			return;
		}

		event.preventDefault();

		// Ignore if not left or middle click
		if ( event.button > 1 ) {
			return;
		}

		const openInNewTab = event.ctrlKey || event.metaKey || event.button === /* middle click */ 1;
		onNavigate( openInNewTab, event );
	};
	return (
		<a
			href={ disabled ? undefined : href }
			{ ...props }
			aria-disabled={ disabled ? true : undefined }
			role={ disabled ? 'link' : undefined }
			onClick={ handleClick }
			onAuxClick={ handleClick }
		/>
	);
};

const SiteField = ( { site, sitePreviewPane }: Props ) => {
	const { adminUrl } = useSiteAdminInterfaceData( site.ID );

	const isWpcomStagingSite = isStagingSite( site );
	const isTrialSitePlan = useSelector( ( state ) => isTrialSite( state, site.ID ) );

	const canManageOptions = useSelector( ( state ) =>
		canCurrentUser( state, site.ID, 'manage_options' )
	);

	const isP2Site = getIsP2Site( site );
	const isSitePreviewPaneEligible = getIsSitePreviewPaneEligible( site, canManageOptions );

	const onSiteClick = ( shouldOpenNewTab: boolean ) => {
		if ( isSitePreviewPaneEligible ) {
			sitePreviewPane.open( site, 'site_field', shouldOpenNewTab );
		} else {
			navigate( adminUrl, shouldOpenNewTab );
		}
	};

	const getBadge = () => {
		if ( isWpcomStagingSite ) {
			return 'staging';
		}

		if ( isTrialSitePlan ) {
			return 'trial';
		}

		if ( isP2Site ) {
			return 'p2';
		}

		return null;
	};

	return (
		// TODO: Consolidate behavior with `SiteIcon` link
		<Link
			className="sites-dataviews__site"
			disabled={ site.is_deleted }
			href={ isSitePreviewPaneEligible ? sitePreviewPane.getUrl( site ) : adminUrl }
			onNavigate={ onSiteClick }
		>
			<NameRenderer
				badge={ getBadge() }
				muted={ !! site.is_deleted }
				value={ getSiteDisplayName( site ) }
			/>
		</Link>
	);
};

export default SiteField;
