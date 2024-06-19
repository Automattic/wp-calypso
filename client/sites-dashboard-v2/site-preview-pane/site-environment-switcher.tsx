import { SiteExcerptData } from '@automattic/sites';
import { DropdownMenu } from '@wordpress/components';
import { chevronDownSmall } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useRef, useState } from 'react';
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
	const popoverButtonRef = useRef< HTMLInputElement >( null );

	if (
		! site.is_wpcom_staging_site &&
		! (
			site.is_wpcom_atomic &&
			site.options?.wpcom_staging_blog_ids &&
			site.options?.wpcom_staging_blog_ids.length > 0
		)
	) {
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
		<div
			tabIndex={ 0 }
			role="button"
			className="site-preview-pane__site-environment-switcher"
			ref={ popoverButtonRef }
			onClick={ () => {
				setIsPopoverVisible( ! isPopoverVisible );
			} }
			onKeyDown={ () => setIsPopoverVisible( ! isPopoverVisible ) }
		>
			{ !! site.is_wpcom_staging_site && (
				<SitesStagingBadge>{ __( 'Staging' ) }</SitesStagingBadge>
			) }

			{ ! site.is_wpcom_staging_site && (
				<SitesProductionBadge>{ __( 'Production' ) }</SitesProductionBadge>
			) }
			<DropdownMenu
				icon={ chevronDownSmall }
				label={ __( 'Select environment' ) }
				popoverProps={ {
					position: 'bottom',
					className: 'site-preview-pane__site-switcher-dropdown-menu',
					anchor: popoverButtonRef.current,
					onFocusOutside: () => setIsPopoverVisible( false ),
				} }
				controls={ [
					{
						title: __( 'Production' ),
						onClick: () => setEnvironment( productionSiteId ),
						isActive: ! site.is_wpcom_staging_site,
					},
					{
						title: __( 'Staging' ),
						onClick: () => setEnvironment( stagingSiteId ),
						isActive: site.is_wpcom_staging_site,
					},
				] }
				onToggle={ () => setIsPopoverVisible( ! isPopoverVisible ) }
				open={ isPopoverVisible }
			/>
		</div>
	);
}
