import {
	ComboboxControl,
	Icon,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { check } from '@wordpress/icons';
import SiteIcon from '../../components/site-icon';
import { getSiteDisplayName } from '../../utils/site-name';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { Site } from '@automattic/api-core';
import './site-dropdown.scss';

interface SiteOption {
	value: string;
	label: string;
	site: Site;
}

interface PreferencesLoginSiteDropdownProps {
	sites: Site[];
	value?: string;
	onChange: ( value: string | null | undefined ) => void;
	label?: string;
	hideLabelFromVision?: boolean;
	isLoading?: boolean;
}

export default function PreferencesLoginSiteDropdown( {
	sites,
	value,
	onChange,
	label = '',
	hideLabelFromVision = false,
	isLoading = false,
}: PreferencesLoginSiteDropdownProps ) {
	// Prepare options for ComboboxControl
	const options: SiteOption[] = sites.map( ( site: Site ) => ( {
		value: site.ID.toString(),
		label: getSiteDisplayName( site ),
		site,
	} ) );

	// Custom render function for each option
	const renderItem = ( { item }: { item: { value: string; label: string } } ) => {
		// Find the matching site option that contains the full site data
		const siteOption = options.find( ( option ) => option.value === item.value );
		if ( ! siteOption ) {
			return null;
		}

		const isSelected = item.value === value;

		return (
			<HStack spacing={ 3 } alignment="left" justify="space-between">
				<HStack spacing={ 3 } alignment="left">
					<SiteIcon site={ siteOption.site } size={ 32 } />
					<VStack spacing={ 0 }>
						{ /**using inherit to allow the text to be styled as white when hovering, otherwise it won't be readable */ }
						<Text as="div" weight={ 500 } size={ 14 } lineHeight={ 1.5 } color="inherit">
							{ item.label }
						</Text>
						<Text as="div" size={ 12 } weight={ 300 } lineHeight={ 1.2 } color="inherit">
							{ getSiteDisplayUrl( siteOption.site ) }
						</Text>
					</VStack>
				</HStack>
				{ isSelected && (
					<Icon
						icon={ check }
						size={ 24 }
						className="dashboard-preferences__login-site-dropdown-icon"
					/>
				) }
			</HStack>
		);
	};

	return (
		<ComboboxControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			className="dashboard-preferences__login-site-dropdown"
			label={ hideLabelFromVision ? '' : label }
			value={ value }
			onChange={ onChange }
			options={ options }
			allowReset={ false }
			isLoading={ isLoading }
			__experimentalRenderItem={ renderItem }
		/>
	);
}
