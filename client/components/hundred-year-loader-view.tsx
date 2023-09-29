import styled from '@emotion/styled';
import { memo, useRef } from 'react';
import type { TranslateResult } from 'i18n-calypso';

const MOBILE_EARTH_LOOP_URL = 'https://wpcom.files.wordpress.com/2023/09/earth-loop-mobile-1-2.mp4';
const DESKTOP_EARTH_LOOP_URL = 'https://wpcom.files.wordpress.com/2023/09/earth-loop-desktop-3.mp4';

type LoaderProps = {
	isMobile: boolean;
	loadingText: TranslateResult;
};

const FullPageContainer = styled.div< { isMobile: boolean } >`
	height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	background-color: black;
	h1 {
		color: var( --studio-gray-0 );
		font-style: normal;
		font-weight: 400;
		line-height: 52px;
		letter-spacing: 0.2px;
		text-align: center;
		z-index: 1;
		font-size: ${ ( { isMobile } ) => ( isMobile ? '32px' : '44px' ) };
		padding: 0 45px;
	}
`;

/**
 * Preload videos so that they are cached in the user's browser
 */
export const VideoPreload = memo( ( { isMobile }: { isMobile: boolean } ) =>
	isMobile ? (
		<video
			src={ MOBILE_EARTH_LOOP_URL }
			preload="auto"
			muted
			style={ { opacity: 0, position: 'fixed', zIndex: -1 } }
		/>
	) : (
		<video
			src={ DESKTOP_EARTH_LOOP_URL }
			preload="auto"
			muted
			style={ { opacity: 0, position: 'fixed', zIndex: -1 } }
		/>
	)
);

function VideoLoader( { isMobile, loadingText }: LoaderProps ) {
	const videoObject = useRef< HTMLVideoElement | null >( null );

	const FullPageVideoContainer = styled( FullPageContainer )< { isMobile: boolean } >`
		video {
			object-fit: cover;
			width: 100vw;
			height: 100vh;
			position: fixed;
			top: 0;
			left: 0;
			opacity: 25%;
		}
	`;
	return (
		<FullPageVideoContainer isMobile={ isMobile }>
			{ isMobile ? (
				<video
					ref={ videoObject }
					src={ MOBILE_EARTH_LOOP_URL }
					preload="auto"
					width="100%"
					height="auto"
					muted
					playsInline
					autoPlay
					loop
				/>
			) : (
				<video
					ref={ videoObject }
					src={ DESKTOP_EARTH_LOOP_URL }
					preload="auto"
					width="100%"
					height="auto"
					muted
					playsInline
					autoPlay
					loop
				/>
			) }
			<h1 className="wp-brand-font">{ loadingText }</h1>
		</FullPageVideoContainer>
	);
}

export default memo( VideoLoader );
