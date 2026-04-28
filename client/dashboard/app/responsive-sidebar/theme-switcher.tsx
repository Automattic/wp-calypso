import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useColorScheme, type ColorScheme } from '../color-scheme';

import './theme-switcher.scss';

export default function ThemeSwitcher() {
	const { colorScheme, setColorScheme } = useColorScheme();

	return (
		<div className="dashboard-sidebar-theme-switcher">
			<ToggleGroupControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				isBlock
				hideLabelFromVision
				label={ __( 'Theme' ) }
				value={ colorScheme }
				onChange={ ( value ) => setColorScheme( value as ColorScheme ) }
			>
				<ToggleGroupControlOption value="light" label={ __( 'Light' ) } />
				<ToggleGroupControlOption value="dark" label={ __( 'Dark' ) } />
				<ToggleGroupControlOption value="system" label={ __( 'Auto' ) } />
			</ToggleGroupControl>
		</div>
	);
}
