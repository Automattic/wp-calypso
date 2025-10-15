import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalToggleGroupControlOptionIcon as ToggleGroupControlOptionIcon,
	Icon,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { mobile, desktop } from '@wordpress/icons';
import type { DeviceToggleType } from './types';

type DeviceToggleProps = {
	value: DeviceToggleType;
	onChange: ( value: DeviceToggleType ) => void;
	disabled?: boolean;
};

export default function DeviceToggle( { value, onChange, disabled }: DeviceToggleProps ) {
	const isDesktop = useViewportMatch( 'medium' );
	const options: { value: DeviceToggleType; label: string; icon: React.ReactElement }[] = [
		{
			value: 'mobile',
			label: __( 'Mobile' ),
			icon: <Icon icon={ mobile } />,
		},
		{
			value: 'desktop',
			label: __( 'Desktop' ),
			icon: <Icon icon={ desktop } />,
		},
	];

	return (
		<ToggleGroupControl
			label={ __( 'Device' ) }
			value={ value }
			isBlock
			disabled={ disabled }
			hideLabelFromVision
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			onChange={ ( value ) => onChange( value as DeviceToggleType ) }
		>
			{ options.map( ( option ) => {
				return isDesktop ? (
					<ToggleGroupControlOption
						key={ option.value }
						value={ option.value }
						label={ option.label }
					/>
				) : (
					<ToggleGroupControlOptionIcon
						key={ option.value }
						value={ option.value }
						label={ option.label }
						icon={ option.icon }
					/>
				);
			} ) }
		</ToggleGroupControl>
	);
}
