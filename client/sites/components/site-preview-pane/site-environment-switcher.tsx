import { SiteExcerptData } from '@automattic/sites';
import { DropdownMenu, Button } from '@wordpress/components';
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
		<DropdownMenu
			icon={ chevronDownSmall }
			label={ __( 'Select environment' ) }
			toggleProps={ {
				as: ( props ) => (
					<ToggleComponent isStaging={ !! site.is_wpcom_staging_site } { ...props } />
				),
			} }
			popoverProps={ {
				position: 'bottom',
				className: 'site-preview-pane__site-switcher-dropdown-menu',
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
		/>
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
