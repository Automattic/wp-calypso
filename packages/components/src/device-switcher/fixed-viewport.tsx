import { CSSProperties } from 'react';

// Device viewport width in pixels
const DEVICE_COMPUTER_WIDTH = 1080;
const DEVICE_TABLET_WIDTH = 782;
const DEVICE_PHONE_WIDTH = 480;

const deviceWidthById = {
	computer: DEVICE_COMPUTER_WIDTH,
	tablet: DEVICE_TABLET_WIDTH,
	phone: DEVICE_PHONE_WIDTH,
} as Record< string, number >;

export const useViewportScale = ( device: string, viewportWidth: number ) => {
	const deviceWidth: number = deviceWidthById[ device ];
	let width = viewportWidth;

	if ( ! viewportWidth ) {
		// Scale is 1 when the feature is disabled
		return 1;
	}

	if ( 'computer' !== device && viewportWidth > deviceWidth ) {
		// Use device width as max width for tablet and phone
		width = deviceWidth;
	}

	return width / deviceWidth;
};

interface Props {
	children: React.ReactNode;
	frameRef?: React.MutableRefObject< HTMLDivElement | null >;
	device: string;
}

const FixedViewport = ( { children, frameRef, device }: Props ) => {
	const viewportWidth = frameRef?.current?.parentElement?.clientWidth as number;
	const viewportScale = useViewportScale( device, viewportWidth );

	return (
		<div
			className="device-switcher__viewport"
			style={
				{
					'--viewport-container-width': viewportWidth,
					'--viewport-width': deviceWidthById[ device ],
					'--viewport-scale': viewportScale,
				} as CSSProperties
			}
		>
			{ children }
		</div>
	);
};

export default FixedViewport;
