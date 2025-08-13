import { SiteExcerptData } from '@automattic/sites';
import { DropdownMenu, Button, MenuItem } from '@wordpress/components';
import { chevronDownSmall } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import SitesProductionBadge from 'calypso/sites-dashboard/components/sites-production-badge';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';

import './site-environment-switcher.scss';

interface SiteEnvironmentSwitcherProps {
	onChange: ( siteId: number ) => void;
	site: SiteExcerptData;
}

export default function SiteEnvironmentSwitcher( {
	onChange,
	site,
}: SiteEnvironmentSwitcherProps ) {
	const { __ } = useI18n();

	// eslint-disable-next-line no-console
	console.log( 'SiteEnvironmentSwitcher site properties', {
		siteId: site.ID,
		is_wpcom_staging_site: site.is_wpcom_staging_site,
		is_wpcom_atomic: site.is_wpcom_atomic,
		wpcom_staging_blog_ids: site.options?.wpcom_staging_blog_ids,
		wpcom_production_blog_id: site.options?.wpcom_production_blog_id,
	} );

	// Show switcher if:
	// 1. Site is a staging site, OR
	// 2. Site is atomic with staging sites, OR
	// 3. Site has a production blog ID (indicating it's a staging site that may not be fully flagged yet)
	const hasEnvironmentSwitchingCapability =
		site.is_wpcom_staging_site ||
		( site.is_wpcom_atomic &&
			site.options?.wpcom_staging_blog_ids &&
			site.options.wpcom_staging_blog_ids.length > 0 ) ||
		( site.options?.wpcom_production_blog_id && site.options.wpcom_production_blog_id > 0 );

	if ( ! hasEnvironmentSwitchingCapability ) {
		// eslint-disable-next-line no-console
		console.log( 'SiteEnvironmentSwitcher hidden: not a staging site and no linked staging site', {
			siteId: site.ID,
		} );
		return;
	}

	// Determine if this is actually a staging site - either flagged as staging OR has a production blog ID
	const isActuallyStaging =
		site.is_wpcom_staging_site ||
		( site.options?.wpcom_production_blog_id && site.options.wpcom_production_blog_id > 0 );

	const productionSiteId = isActuallyStaging ? site.options?.wpcom_production_blog_id : site.ID;

	const stagingSiteId = ! isActuallyStaging ? site.options?.wpcom_staging_blog_ids?.[ 0 ] : site.ID; // If we're on staging, the current site IS the staging site

	// eslint-disable-next-line no-console
	console.log( 'Environment switcher IDs', {
		siteId: site.ID,
		isActuallyStaging,
		productionSiteId,
		stagingSiteId,
	} );

	// If we don't have valid site IDs for switching, don't show the switcher
	if ( ! productionSiteId || productionSiteId === 0 ) {
		// eslint-disable-next-line no-console
		console.log( 'SiteEnvironmentSwitcher hidden: invalid production site ID', {
			siteId: site.ID,
			productionSiteId,
		} );
		return;
	}

	const setEnvironment = ( siteIdToChange: number | undefined ) => {
		if ( siteIdToChange === site.ID ) {
			return;
		}

		onChange( siteIdToChange as number );
	};

	return (
		<DropdownMenu
			icon={ chevronDownSmall }
			label={ __( 'Select environment' ) }
			toggleProps={ {
				as: ( props ) => <ToggleComponent isStaging={ isActuallyStaging } { ...props } />,
			} }
			popoverProps={ {
				placement: 'bottom-start',
				className: 'site-preview-pane__site-switcher-dropdown-menu',
			} }
		>
			{ ( { onClose } ) => (
				<>
					<MenuItem
						onClick={ () => {
							setEnvironment( productionSiteId );
							onClose();
						} }
						aria-pressed={ ! isActuallyStaging ? 'true' : 'false' }
					>
						{ __( 'Production' ) }
					</MenuItem>
					{ stagingSiteId && (
						<MenuItem
							onClick={ () => {
								setEnvironment( stagingSiteId );
								onClose();
							} }
							aria-pressed={ isActuallyStaging ? 'true' : 'false' }
						>
							{ __( 'Staging' ) }
						</MenuItem>
					) }
				</>
			) }
		</DropdownMenu>
	);
}

function ToggleComponent( {
	isStaging,
	className,
	...props
}: {
	isStaging: boolean;
	className: never;
} ) {
	const { __ } = useI18n();

	const mergedClasses = clsx( 'site-preview-pane__site-environment-switcher', className );

	return (
		<Button
			className={ mergedClasses }
			{ ...props }
			iconPosition="right"
			style={ { padding: 0, height: 'auto' } }
		>
			{ isStaging && <SitesStagingBadge>{ __( 'Staging' ) }</SitesStagingBadge> }

			{ ! isStaging && <SitesProductionBadge>{ __( 'Production' ) }</SitesProductionBadge> }
		</Button>
	);
}
