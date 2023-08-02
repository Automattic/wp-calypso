import { useResizeObserver } from '@wordpress/compose';
import classnames from 'classnames';
import { useState, useEffect, useRef } from 'react';
import { DEVICE_TYPES } from './constants';
import FixedViewport, { useViewportScale } from './fixed-viewport';
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
	isFixedViewport?: boolean;
	isFullscreen?: boolean;
	frameRef?: React.MutableRefObject< HTMLDivElement | null >;
	onDeviceChange?: ( device: Device ) => void;
	onViewportChange?: ( height?: number ) => void;
}

// Transition animation delay
const ANIMATION_DURATION = 250;

const DeviceSwitcher = ( {
	children,
	className = '',
	defaultDevice = DEVICE_TYPES.COMPUTER,
	isShowDeviceSwitcherToolbar,
	isShowFrameBorder,
	isShowFrameShadow = true,
	isFixedViewport,
	isFullscreen,
	frameRef,
	onDeviceChange,
	onViewportChange,
}: Props ) => {
	const [ device, setDevice ] = useState< Device >( defaultDevice );
	const [ containerResizeListener, { width, height } ] = useResizeObserver();
	const timerRef = useRef< null | ReturnType< typeof setTimeout > >( null );
	const viewportElement = frameRef?.current?.parentElement;
	const viewportWidth = viewportElement?.clientWidth as number;
	const viewportHeight = viewportElement?.clientHeight as number;
	const viewportScale = useViewportScale( device, viewportWidth );

	const handleDeviceClick = ( nextDevice: Device ) => {
		setDevice( nextDevice );
		onDeviceChange?.( nextDevice );
	};

	const clearAnimationEndTimer = () => {
		if ( timerRef.current ) {
			clearTimeout( timerRef.current );
		}
	};

	// Animate on viewport size update
	useEffect( () => {
		clearAnimationEndTimer();

		// Trigger animation end after the duration
		timerRef.current = setTimeout( () => {
			timerRef.current = null;

			let height = frameRef?.current?.clientHeight;

			// Scale height including the border from --device-switcher-border-width
			if ( isFixedViewport ) {
				const deviceSwitcherBorder = 20;
				const borderScaled = deviceSwitcherBorder * viewportScale;
				height = ( viewportHeight - borderScaled ) / viewportScale;
			}

			onViewportChange?.( height );
		}, ANIMATION_DURATION );

		return clearAnimationEndTimer;
	}, [ width, height, viewportScale ] );

	const frame = (
		<div className="device-switcher__frame" ref={ frameRef }>
			{ children }
		</div>
	);

	return (
		<div
			className={ classnames( className, 'device-switcher__container', {
				'device-switcher__container--frame-fixed-viewport': isFixedViewport,
				'device-switcher__container--frame-shadow': isShowFrameShadow,
				'device-switcher__container--frame-bordered': isShowFrameBorder,
				'device-switcher__container--is-computer': device === 'computer',
				'device-switcher__container--is-tablet': device === 'tablet',
				'device-switcher__container--is-phone': device === 'phone',
				'device-switcher__container--is-fullscreen': isFullscreen,
			} ) }
		>
			{ isShowDeviceSwitcherToolbar && (
				<DeviceSwitcherToolbar device={ device } onDeviceClick={ handleDeviceClick } />
			) }
			{ isFixedViewport ? (
				<FixedViewport device={ device } frameRef={ frameRef }>
					{ frame }
				</FixedViewport>
			) : (
				frame
			) }
			{ containerResizeListener }
		</div>
	);
};

export default DeviceSwitcher;
