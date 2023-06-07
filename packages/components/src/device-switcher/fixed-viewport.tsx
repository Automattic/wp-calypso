import { CSSProperties } from 'react';

// Desktop viewport width in pixels
const DEVICE_COMPUTER_WIDTH = 1080;
const DEVICE_TABLET_WIDTH = 782;
const DEVICE_PHONE_WIDTH = 480;

const deviceWidth = {
	computer: DEVICE_COMPUTER_WIDTH,
	tablet: DEVICE_TABLET_WIDTH,
	phone: DEVICE_PHONE_WIDTH,
} as Record< string, number >;

export const useViewportScale = ( device: string, frameWidth: number ) => {
	const viewportWidth: number = deviceWidth[ device ];
	return frameWidth / viewportWidth;
};

interface Props {
	children: React.ReactNode;
	frameRef?: React.MutableRefObject< HTMLDivElement | null >;
	device: string;
}

const FixedViewport = ( { children, frameRef, device }: Props ) => {
	const frameWidth = frameRef?.current?.clientWidth ?? 0;
	const viewportScale = useViewportScale( device, frameWidth );

	return (
		<div
			style={
				{
					'--viewport-width': deviceWidth[ device ],
					'--viewport-scale': viewportScale,
				} as CSSProperties
			}
			className="device-switcher__viewport"
		>
			{ children }
		</div>
	);
};

export default FixedViewport;
