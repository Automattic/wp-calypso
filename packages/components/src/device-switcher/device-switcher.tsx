import { RangeControl } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { search } from '@wordpress/icons';
import classnames from 'classnames';
import { useState, useEffect, useRef } from 'react';
import { DEVICE_TYPES } from './constants';
import FixedViewport, { useViewportScale } from './fixed-viewport';
import DeviceSwitcherToolbar from './toolbar';
import useZoomOut from './use-zoom-out';
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
	isZoomable?: boolean;
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
	isZoomable,
	frameRef,
	onDeviceChange,
	onViewportChange,
}: Props ) => {
	const [ device, setDevice ] = useState< Device >( defaultDevice );
	const [ containerResizeListener, { width, height } ] = useResizeObserver();
	const timerRef = useRef< null | ReturnType< typeof setTimeout > >( null );
	const viewportElement = frameRef?.current?.parentElement;
	const viewportWidth = viewportElement?.clientWidth as number;
	const viewportScale = useViewportScale( device, viewportWidth );
	const { zoomOutScale, zoomOutStyles, onZoomOutScaleChange } = useZoomOut();

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
			onViewportChange?.( frameRef?.current?.clientHeight );
		}, ANIMATION_DURATION );

		return clearAnimationEndTimer;
	}, [ width, height, viewportScale, isFixedViewport ] );

	const content = isZoomable ? <div style={ zoomOutStyles }>{ children }</div> : children;

	const frame = (
		<div className="device-switcher__frame" ref={ frameRef }>
			{ content }
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
				'device-switcher__container--is-zoomable': isZoomable,
			} ) }
		>
			<div className="device-switcher__header">
				{ isShowDeviceSwitcherToolbar && (
					<DeviceSwitcherToolbar device={ device } onDeviceClick={ handleDeviceClick } />
				) }
				{ isZoomable && (
					<RangeControl
						className="device-switcher__zoom-out"
						beforeIcon={ search }
						withInputField={ false }
						showTooltip={ false }
						color="#C3C4C7"
						trackColor="#50575E"
						__nextHasNoMarginBottom
						value={ Math.round( zoomOutScale * 100 ) }
						onChange={ ( value ) => value !== undefined && onZoomOutScaleChange( value / 100 ) }
						min={ 1 }
						max={ 100 }
					/>
				) }
			</div>
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
