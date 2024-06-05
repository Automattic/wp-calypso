import { SelectDropdown } from '@automattic/components';
import { SiteExcerptData } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';

interface SiteEnvironmentDropdownProps {
	onChange: ( siteId: number ) => void;
	site: SiteExcerptData;
}

export default function SiteEnvironmentDropdown( {
	onChange,
	site,
}: SiteEnvironmentDropdownProps ) {
	const { __ } = useI18n();

	const selectedEnvironment = site.is_wpcom_staging_site ? 'staging' : 'production';
	const productionSiteId = site.is_wpcom_staging_site
		? site.options?.wpcom_production_blog_id
		: site.ID;

	const stagingSiteId = ! site.is_wpcom_staging_site
		? site.options?.wpcom_staging_blog_ids?.[ 0 ]
		: null;

	const setEnvironment = ( option: { value: string; label: string } ) => {
		if ( option.value === selectedEnvironment ) {
			return;
		}

		const siteIdToChange = option.value === 'production' ? productionSiteId : stagingSiteId;

		onChange( siteIdToChange as number );
	};

	return (
		<SelectDropdown
			showSelectedOption
			options={ [
				{ value: 'production', label: __( 'Production' ) },
				{ value: 'staging', label: __( 'Staging' ) },
			] }
			onSelect={ setEnvironment }
			initialSelected={ selectedEnvironment }
		/>
	);
}
