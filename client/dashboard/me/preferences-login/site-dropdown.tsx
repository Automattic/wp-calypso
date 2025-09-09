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
					<SiteIcon site={ siteOption.site } size={ 24 } />
					<VStack spacing={ 0 }>
						<Text as="div" weight={ 500 } lineHeight={ 1.2 }>
							{ item.label }
						</Text>
						<Text as="div" variant="muted" size={ 13 } lineHeight={ 1.2 }>
							{ getSiteDisplayUrl( siteOption.site ) }
						</Text>
					</VStack>
				</HStack>
				{ isSelected && <Icon icon={ check } size={ 18 } /> }
			</HStack>
		);
	};

	return (
		<ComboboxControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={ hideLabelFromVision ? '' : label }
			value={ value }
			onChange={ onChange }
			options={ options }
			__experimentalRenderItem={ renderItem }
		/>
	);
}
