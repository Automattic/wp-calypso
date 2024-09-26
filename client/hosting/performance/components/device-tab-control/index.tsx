import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export type Tab = 'mobile' | 'desktop';

type DeviceTabControlsProps = {
	onDeviceTabChange: ( tab: Tab ) => void;
	value: Tab;
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
