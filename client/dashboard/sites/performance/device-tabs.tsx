import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export type TabType = 'mobile' | 'desktop';

type DeviceTabControlsProps = {
	value: TabType;
	onChange: ( value: TabType ) => void;
};

export default function DeviceTabControls( { value, onChange }: DeviceTabControlsProps ) {
	const options: { value: TabType; label: string }[] = [
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
		<div className="site-performance-device-tab__container">
			<ToggleGroupControl
				label={ __( 'Device' ) }
				value={ value }
				isBlock
				__next40pxDefaultSize
				onChange={ ( value ) => onChange( value as TabType ) }
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
		</div>
	);
}
