import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export type ToggleType = 'mobile' | 'desktop';

type DeviceToggleProps = {
	value: ToggleType;
	onChange: ( value: ToggleType ) => void;
};

export default function DeviceToggle( { value, onChange }: DeviceToggleProps ) {
	const options: { value: ToggleType; label: string }[] = [
		{
			value: 'mobile',
			label: __( 'Mobile' ),
		},
		{
			value: 'desktop',
			label: __( 'Desktop' ),
		},
	];

	return (
		<ToggleGroupControl
			label={ __( 'Device' ) }
			value={ value }
			isBlock
			hideLabelFromVision
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			onChange={ ( value ) => onChange( value as ToggleType ) }
		>
			{ options.map( ( option ) => {
				return (
					<ToggleGroupControlOption
						key={ option.value }
						value={ option.value }
						label={ option.label }
					/>
				);
			} ) }
		</ToggleGroupControl>
	);
}
