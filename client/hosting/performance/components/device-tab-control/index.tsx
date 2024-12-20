import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { TabType } from 'calypso/performance-profiler/components/header';

import './style.scss';

type DeviceTabControlsProps = {
	onDeviceTabChange: ( tab: TabType ) => void;
	value: TabType;
	showTitle?: boolean;
	disabled?: boolean;
};

export const DeviceTabControls = ( {
	onDeviceTabChange,
	value,
	showTitle,
	disabled,
}: DeviceTabControlsProps ) => {
	const translate = useTranslate();

	const options: { value: TabType; label: string }[] = [
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
			{ showTitle && (
				<div className="site-performance-device-tab__heading">{ translate( 'Device' ) }</div>
			) }
			<SegmentedControl
				className={ clsx( 'site-performance-device-tab__controls', { [ 'disabled' ]: disabled } ) }
			>
				{ options.map( ( option ) => {
					return (
						<SegmentedControl.Item
							key={ option.value }
							value={ option.value }
							selected={ value === option.value }
							onClick={ () => onDeviceTabChange( option.value ) }
						>
							{ option.label }
						</SegmentedControl.Item>
					);
				} ) }
			</SegmentedControl>
		</div>
	);
};
