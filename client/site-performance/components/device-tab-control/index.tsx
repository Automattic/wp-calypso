import { SegmentedControl } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';

import './style.scss';

type DeviceTabControlsProps = {
	onDeviceTabChange: ( tab: string ) => void;
};

export const DeviceTabControls = ( { onDeviceTabChange }: DeviceTabControlsProps ) => {
	const translate = useTranslate();
	const [ selectedOption, setSelectedOption ] = useState( 'mobile' );

	const handleOptionClick = ( newSelectedOption: string ) => {
		setSelectedOption( newSelectedOption );

		onDeviceTabChange( newSelectedOption );
	};

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
							selected={ selectedOption === option.value }
							onClick={ () => handleOptionClick( option.value ) }
						>
							{ option.label }
						</SegmentedControl.Item>
					);
				} ) }
			</SegmentedControl>
		</div>
	);
};
