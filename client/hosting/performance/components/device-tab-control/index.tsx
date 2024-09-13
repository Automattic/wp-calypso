import { SegmentedControl } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export type Tab = 'mobile' | 'desktop';

type DeviceTabControlsProps = {
	onDeviceTabChange: ( tab: Tab ) => void;
	value: Tab;
};

export const DeviceTabControls = ( { onDeviceTabChange, value }: DeviceTabControlsProps ) => {
	const translate = useTranslate();

	const options = [
		{
			value: 'mobile',
			label: translate( 'Mobile' ),
		},
		{
			value: 'desktop',
			label: translate( 'Desktop' ),
		},
	];

	return (
		<div className="site-performance-device-tab__container">
			<div className="site-performance-device-tab__heading">{ translate( 'Device' ) }</div>
			<SegmentedControl className="site-performance-device-tab__controls">
				{ options.map( ( option ) => {
					return (
						<SegmentedControl.Item
							key={ option.value }
							value={ option.value }
							selected={ value === option.value }
							onClick={ () => onDeviceTabChange( option.value as Tab ) }
						>
							{ option.label }
						</SegmentedControl.Item>
					);
				} ) }
			</SegmentedControl>
		</div>
	);
};
