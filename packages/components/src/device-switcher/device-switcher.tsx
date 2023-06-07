import { useResizeObserver } from '@wordpress/compose';
import classnames from 'classnames';
import { useState, useEffect, useReducer, useRef } from 'react';
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
	frameRef?: React.MutableRefObject< HTMLDivElement | null >;
	onDeviceChange?: ( device: Device ) => void;
	onAnimationEnd?: ( scale: number ) => void;
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
	frameRef,
	onDeviceChange,
	onAnimationEnd,
}: Props ) => {
	const [ device, setDevice ] = useState< Device >( defaultDevice );
	const [ , forceUpdate ] = useReducer( ( x ) => x + 1, 0 );
	const [ containerResizeListener, { width, height } ] = useResizeObserver();
	const animationRef = useRef< null | ReturnType< typeof setTimeout > >( null );
	const requestRef = useRef< null | number >( null );
	const frameWidth = frameRef?.current?.clientWidth ?? 0;
	const viewportScale = useViewportScale( device, frameWidth );

	const handleDeviceClick = ( nextDevice: Device ) => {
		setDevice( nextDevice );
		onDeviceChange?.( nextDevice );
		setTimeout( () => {
			// Callback on animation end
			onAnimationEnd?.( viewportScale );
		}, ANIMATION_DURATION );
	};

	const animation = () => {
		// Update state to animate the viewport
		if ( animationRef.current ) {
			forceUpdate();
		}
		// Continue animation loop
		requestRef.current = requestAnimationFrame( animation );
	};

	useEffect( () => {
		if ( isFixedViewport ) {
			// Start animation loop on mount
			requestRef.current = requestAnimationFrame( animation );
			return () => {
				cancelAnimationFrame( requestRef.current as number );
			};
		}
	}, [] );

	// Animate on width and height updates
	useEffect( () => {
		if ( animationRef.current ) {
			clearTimeout( animationRef.current );
		}

		animationRef.current = setTimeout( () => {
			// Stop animation after the duration
			animationRef.current = null;
			// Callback on animation end
			onAnimationEnd?.( viewportScale );
		}, ANIMATION_DURATION );

		return () => {
			if ( animationRef.current ) {
				clearTimeout( animationRef.current );
			}
		};
	}, [ width, height, viewportScale ] );

	return (
		<div
			className={ classnames( className, 'device-switcher__container', {
				'device-switcher__container--frame-fixed-viewport': isFixedViewport,
				'device-switcher__container--frame-shadow': isShowFrameShadow,
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
				{ containerResizeListener }
				{ isFixedViewport ? (
					<FixedViewport device={ device } frameRef={ frameRef }>
						{ children }
					</FixedViewport>
				) : (
					children
				) }
			</div>
		</div>
	);
};

export default DeviceSwitcher;
