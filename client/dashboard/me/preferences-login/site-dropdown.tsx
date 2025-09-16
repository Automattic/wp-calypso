import {
	ComboboxControl,
	Icon,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { check, globe } from '@wordpress/icons';
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
}

// Simple site icon component following dashboard pattern
function SiteIcon( { site, size = 24 }: { site: Site; size?: number } ) {
	const dims = { width: size, height: size };
	const ico = site.icon?.ico;
	const src = useMemo( () => {
		if ( ! ico ) {
			return;
		}
		const url = new URL( ico );
		url.searchParams.set( 'w', '48' );
		url.searchParams.set( 's', '48' );
		return url.toString();
	}, [ ico ] );

	if ( ico && src ) {
		return (
			<img
				src={ src }
				alt={ site.name }
				{ ...dims }
				loading="lazy"
				style={ {
					width: size,
					height: size,
					minWidth: size,
					borderRadius: '4px',
					objectFit: 'cover',
				} }
			/>
		);
	}

	// Fallback to WordPress globe icon
	return (
		<div
			style={ {
				...dims,
				backgroundColor: '#ddd',
				borderRadius: '4px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: '#666',
			} }
		>
			<Icon icon={ globe } size={ size * 0.7 } />
		</div>
	);
}

export default function PreferencesLoginSiteDropdown( {
	sites,
	value,
	onChange,
	label = '',
	hideLabelFromVision = false,
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
			__experimentalRenderItem={ renderItem }
		/>
	);
}
