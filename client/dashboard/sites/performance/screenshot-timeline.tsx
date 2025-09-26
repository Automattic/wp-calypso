import styled from '@emotion/styled';
import {
	__experimentalText as Text,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Modal,
	Card,
	CardBody,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { ScreenShotsTimeLine } from './core-metrics';

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

export default function ScreenshotTimeline( { screenshots }: Props ) {
	const [ overlay, setOverlay ] = useState< OverlayState >( {
		isOpen: false,
	} );
	if ( ! screenshots || ! screenshots.length ) {
		return null;
	}

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 6 }>
					<Text size={ 15 } weight={ 500 }>
						{ __( 'Page load timeline' ) }
					</Text>
					{ overlay.isOpen && overlay.screenshot && (
						<ScreenshotModal
							onRequestClose={ () => setOverlay( { isOpen: false } ) }
							contentLabel={ __( 'Screenshot preview' ) }
						>
							<img
								style={ { width: '100%', height: 'auto' } }
								alt={ overlay.timing }
								src={ overlay.screenshot.data }
							/>
						</ScreenshotModal>
					) }
					<HStack spacing={ 4 }>
						{ screenshots.map( ( screenshot, index ) => {
							const timing = `${ ( screenshot.timing / 1000 ).toFixed( 1 ) }s`;
							return (
								<VStack key={ index } spacing={ 2 } alignment="center">
									<Card style={ { overflow: 'hidden' } }>
										<img
											style={ {
												display: 'block',
												width: '100%',
												height: 'auto',
												cursor: 'pointer',
											} }
											alt={ timing }
											src={ screenshot.data }
											onClick={ () =>
												setOverlay( { isOpen: true, screenshot: screenshot, timing: timing } )
											}
										/>
									</Card>
									<Text size="small" variant="muted">
										{ timing }
									</Text>
								</VStack>
							);
						} ) }
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
