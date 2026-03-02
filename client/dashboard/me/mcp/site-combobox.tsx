import { Badge } from '@automattic/ui';
import {
	ComboboxControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import SiteIcon from '../../components/site-icon';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { Site } from '@automattic/api-core';

import './site-combobox.scss';

export interface SiteComboboxOption {
	value: string;
	label: string;
	badge?: string;
}

interface SiteComboboxProps {
	sites: Site[];
	options: SiteComboboxOption[];
	onChange: ( value: string | null | undefined ) => void;
	placeholder?: string;
	label?: string;
	disabled?: boolean;
}

export default function SiteCombobox( {
	sites,
	options,
	onChange,
	placeholder,
	label,
	disabled,
}: SiteComboboxProps ) {
	// Build a lookup so we can find the badge for each option by value.
	const badgeByValue = new Map< string, string >();
	options.forEach( ( opt ) => {
		if ( opt.badge ) {
			badgeByValue.set( opt.value, opt.badge );
		}
	} );

	const renderItem = ( { item }: { item: { value: string; label: string } } ) => {
		const site = sites.find( ( s ) => String( s.ID ) === item.value );
		const badge = badgeByValue.get( item.value );

		return (
			<HStack spacing={ 3 } alignment="left">
				{ site && <SiteIcon site={ site } size={ 32 } /> }
				<VStack spacing={ 0 }>
					<HStack spacing={ 2 } alignment="left">
						<Text as="div" weight={ 500 } size={ 14 } lineHeight={ 1.5 } color="inherit">
							{ item.label }
						</Text>
						{ badge && <Badge intent="warning">{ badge }</Badge> }
					</HStack>
					{ site && (
						<Text as="div" size={ 12 } weight={ 300 } lineHeight={ 1.2 } color="inherit">
							{ getSiteDisplayUrl( site ) }
						</Text>
					) }
				</VStack>
			</HStack>
		);
	};

	return (
		<div style={ disabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined }>
			<ComboboxControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				className="mcp-site-combobox"
				label={ label }
				hideLabelFromVision
				value={ null }
				onChange={ onChange }
				options={ options }
				placeholder={ placeholder }
				__experimentalRenderItem={ renderItem }
			/>
		</div>
	);
}
