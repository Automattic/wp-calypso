import classnames from 'classnames';
import { useState } from 'react';
import { DEVICE_TYPES } from './constants';
import DeviceSwitcherToolbar from './toolbar';
import type { Device } from './types';
import './device-switcher.scss';

interface Props {
	children: React.ReactNode;
	className?: string;
	defaultDevice?: Device;
	isShowDeviceSwitcherToolbar?: boolean;
	isShowFrameBorder?: boolean;
	frameRef?: React.MutableRefObject< HTMLDivElement | null >;
	onDeviceChange?: ( device: Device ) => void;
}

const DeviceSwitcher = ( {
	children,
	className = '',
	defaultDevice = DEVICE_TYPES.COMPUTER,
	isShowDeviceSwitcherToolbar,
	isShowFrameBorder,
	frameRef,
	onDeviceChange,
}: Props ) => {
	const [ device, setDevice ] = useState< Device >( defaultDevice );

	const handleDeviceClick = ( nextDevice: Device ) => {
		setDevice( nextDevice );
		onDeviceChange?.( nextDevice );
	};

	return (
		<div
			className={ classnames( className, 'device-switcher__container', {
				'device-switcher__container--frame-bordered': isShowFrameBorder,
				'device-switcher__container--is-computer': device === 'computer',
				'device-switcher__container--is-tablet': device === 'tablet',
				'device-switcher__container--is-phone': device === 'phone',
			} ) }
		>
			{ isShowDeviceSwitcherToolbar && (
				<DeviceSwitcherToolbar device={ device } onDeviceClick={ handleDeviceClick } />
			) }
			<div className="device-switcher__frame" ref={ frameRef }>
				{ children }
			</div>
		</div>
	);
};

export default DeviceSwitcher;
