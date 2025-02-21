import { useResizeObserver } from '@wordpress/compose';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
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
	isShowFrameShadow?: boolean;
	isFullscreen?: boolean;
	frameRef?: React.MutableRefObject< HTMLDivElement | null >;
	onDeviceChange?: ( device: Device ) => void;
	onViewportChange?: ( height?: number ) => void;
}

// Transition animation delay
const ANIMATION_DURATION = 250;
const { COMPUTER, TABLET, PHONE } = DEVICE_TYPES;

const DeviceSwitcher = ( {
	children,
	className = '',
	defaultDevice = COMPUTER,
	isShowDeviceSwitcherToolbar,
	isShowFrameBorder,
	isShowFrameShadow = true,
	isFullscreen,
	frameRef,
	onDeviceChange,
	onViewportChange,
}: Props ) => {
	const [ device, setDevice ] = useState< Device >( defaultDevice );
	const [ containerResizeListener, { width, height } ] = useResizeObserver();

	const timerRef = useRef< null | ReturnType< typeof setTimeout > >( null );

	const handleDeviceClick = ( nextDevice: Device ) => {
		setDevice( nextDevice );
		onDeviceChange?.( nextDevice );
	};

	// Animate on viewport size update
	useEffect( () => {
		const clearAnimationEndTimer = () => {
			if ( timerRef.current ) {
				clearTimeout( timerRef.current );
			}
		};

		// Trigger animation end after the duration
		timerRef.current = setTimeout( () => {
			timerRef.current = null;
			const frameHeight = frameRef?.current?.getBoundingClientRect()?.height;
			if ( frameHeight ) {
				onViewportChange?.( frameHeight );
			}
		}, ANIMATION_DURATION );

		return clearAnimationEndTimer;
	}, [ width, height ] );

	return (
		<div
			className={ clsx( className, 'device-switcher__container', {
				'device-switcher__container--frame-shadow': isShowFrameShadow,
				'device-switcher__container--frame-bordered': isShowFrameBorder,
				'device-switcher__container--is-computer': device === COMPUTER,
				'device-switcher__container--is-tablet': device === TABLET,
				'device-switcher__container--is-phone': device === PHONE,
				'device-switcher__container--is-fullscreen': isFullscreen,
			} ) }
		>
			<div className="device-switcher__header">
				{ isShowDeviceSwitcherToolbar && (
					<DeviceSwitcherToolbar device={ device } onDeviceClick={ handleDeviceClick } />
				) }
			</div>
			<div className="device-switcher__frame" ref={ frameRef }>
				{ children }
			</div>
			{ containerResizeListener }
		</div>
	);
};

export default DeviceSwitcher;
