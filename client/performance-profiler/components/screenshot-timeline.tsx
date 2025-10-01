import styled from '@emotion/styled';
import { Modal } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import { ScreenShotsTimeLine } from 'calypso/data/site-profiler/types';

const Container = styled.div`
	width: 100%;
	box-sizing: border-box;
	border: 1px solid var( --studio-gray-5 );
	padding: 24px;
	border-radius: 4px;
	overflow: hidden;
	background: var( --studio-white );
`;

const Timeline = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	gap: 1.5rem;
	text-align: center;
	overflow: auto;
	padding: 0 2px;
`;

const H2 = styled.h2`
	font-weight: 500;
	font-size: 1rem;
	margin-bottom: 8px;
`;

const Thumbnail = styled.img`
	border: 1px solid var( --studio-gray-0 );
	border-radius: 6px;
	width: 100%;
	min-width: 60px;
	cursor: pointer;
`;

const Tick = styled.p`
	margin: 6px 0 0;
	color: var( --studio-gray-80 );
	font-size: 0.875rem;
`;
const Img = styled.img`
	width: 100%;
	height: auto;
`;

const ScreenshotModal = styled( Modal )`
	@media ( min-width: 600px ) {
		max-height: initial;

		.components-modal__content {
			padding: 0;
			margin-top: 0;
		}

		.components-modal__header {
			button {
				position: relative;
			}

			button::before,
			button::after {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				border-radius: 50%;
				background-color: black;
				mix-blend-mode: screen;
			}

			button::before {
				background-color: white;
				mix-blend-mode: difference;
			}

			button::after {
				background-color: black;
				mix-blend-mode: screen;
			}

			button svg {
				fill: white;
				width: 16px;
				height: 16px;
				mix-blend-mode: difference;
			}
		}
	}
`;

type Props = { screenshots: ScreenShotsTimeLine[] };

type OverlayState = {
	isOpen: boolean;
	screenshot?: ScreenShotsTimeLine;
	timing?: string;
};

export const ScreenshotTimeline = ( { screenshots }: Props ) => {
	const { __ } = useI18n();
	const [ overlay, setOverlay ] = useState< OverlayState >( {
		isOpen: false,
	} );
	if ( ! screenshots || ! screenshots.length ) {
		return null;
	}

	return (
		<Container>
			<H2>{ translate( 'Timeline' ) }</H2>
			<p>{ translate( 'How your site appears to users while loading.' ) }</p>
			{ overlay.isOpen && overlay.screenshot && (
				<ScreenshotModal
					onRequestClose={ () => setOverlay( { isOpen: false } ) }
					contentLabel={ __( 'Screenshot preview' ) }
				>
					<Img alt={ overlay.timing } src={ overlay.screenshot.data } />
				</ScreenshotModal>
			) }
			<Timeline>
				{ screenshots.map( ( screenshot, index ) => {
					const timing = `${ ( screenshot.timing / 1000 ).toFixed( 1 ) }s`;
					return (
						<div key={ index }>
							<Thumbnail
								alt={ timing }
								src={ screenshot.data }
								onClick={ () =>
									setOverlay( { isOpen: true, screenshot: screenshot, timing: timing } )
								}
							/>
							<Tick>{ timing }</Tick>
						</div>
					);
				} ) }
			</Timeline>
		</Container>
	);
};
