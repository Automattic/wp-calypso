import {
	Notice,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { isColorScheme, useColorScheme } from 'calypso/lib/color-scheme';
import { useAnalytics } from '../../app/analytics';
import { SectionHeader } from '../section-header';

export default function AppearanceControl( { source }: { source: string } ) {
	const { colorScheme, setColorScheme, isSaving } = useColorScheme();
	const { recordTracksEvent } = useAnalytics();
	const [ hasError, setHasError ] = useState( false );

	const handleChange = ( value: string | number | undefined ) => {
		if ( ! isColorScheme( value ) || value === colorScheme || isSaving ) {
			return;
		}

		const previousColorScheme = colorScheme;
		setHasError( false );
		setColorScheme( value, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_color_scheme_change', {
					color_scheme: value,
					previous_color_scheme: previousColorScheme,
					source,
				} );
			},
			onError: () => setHasError( true ),
		} );
	};

	return (
		<VStack spacing={ 4 }>
			<SectionHeader
				level={ 3 }
				title={ __( 'Color scheme' ) }
				description={ __(
					'Set the dashboard appearance to light, dark, or your system setting. This setting will also apply to other supported surface areas.'
				) }
			/>
			<ToggleGroupControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				isBlock
				label={ __( 'Color scheme' ) }
				value={ colorScheme }
				onChange={ handleChange }
				aria-busy={ isSaving }
			>
				<ToggleGroupControlOption value="light" label={ __( 'Light' ) } disabled={ isSaving } />
				<ToggleGroupControlOption value="dark" label={ __( 'Dark' ) } disabled={ isSaving } />
				<ToggleGroupControlOption value="system" label={ __( 'System' ) } disabled={ isSaving } />
			</ToggleGroupControl>
			{ hasError && (
				<Notice status="error" isDismissible={ false }>
					{ __( 'Your appearance setting couldn’t be saved. Please try again.' ) }
				</Notice>
			) }
		</VStack>
	);
}
