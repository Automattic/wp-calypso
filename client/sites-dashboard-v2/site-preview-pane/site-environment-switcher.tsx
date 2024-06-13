import { SiteExcerptData } from '@automattic/sites';
import { Icon, chevronDownSmall } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useRef, useState } from 'react';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import SitesProductionBadge from 'calypso/sites-dashboard/components/sites-production-badge';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';

interface SiteEnvironmentSwitcherProps {
	onChange: ( siteId: number ) => void;
	site: SiteExcerptData;
}

export default function SiteEnvironmentSwitcher( {
	onChange,
	site,
}: SiteEnvironmentSwitcherProps ) {
	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );
	const { __ } = useI18n();
	const popoverButtonRef = useRef( null );
	const closeMenu = useCallback( () => setIsPopoverVisible( false ), [] );

	if ( ! site.is_wpcom_staging_site && ! site.is_wpcom_atomic ) {
		return;
	}

	const productionSiteId = site.is_wpcom_staging_site
		? site.options?.wpcom_production_blog_id
		: site.ID;

	const stagingSiteId = ! site.is_wpcom_staging_site
		? site.options?.wpcom_staging_blog_ids?.[ 0 ]
		: undefined;

	const setEnvironment = ( siteIdToChange: number | undefined ) => {
		if ( siteIdToChange === site.ID ) {
			return;
		}

		onChange( siteIdToChange as number );
	};

	return (
		<div className="site-preview-pane__site-environment-switcher">
			{ !! site.is_wpcom_staging_site && (
				<SitesStagingBadge>{ __( 'Staging' ) }</SitesStagingBadge>
			) }

			{ !! site.is_wpcom_atomic &&
				!! site.options?.wpcom_staging_blog_ids?.length &&
				site.options?.wpcom_staging_blog_ids?.length > 0 && (
					<SitesProductionBadge>{ __( 'Production' ) }</SitesProductionBadge>
				) }
			<Icon
				icon={ chevronDownSmall }
				ref={ popoverButtonRef }
				onClick={ () => setIsPopoverVisible( ! isPopoverVisible ) }
			/>

			<PopoverMenu
				context={ popoverButtonRef.current }
				onClose={ closeMenu }
				position="bottom"
				isVisible={ isPopoverVisible }
			>
				<PopoverMenuItem onClick={ () => setEnvironment( productionSiteId ) }>
					{ __( 'Production' ) }
				</PopoverMenuItem>
				<PopoverMenuItem action="B" onClick={ () => setEnvironment( stagingSiteId ) }>
					{ __( 'Staging' ) }
				</PopoverMenuItem>
			</PopoverMenu>
		</div>
	);
}
