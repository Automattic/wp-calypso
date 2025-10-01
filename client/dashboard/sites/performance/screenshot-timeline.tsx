import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	Modal,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { Text } from '../../components/text';

export type ScreenShotsTimeLine = {
	data: string;
	timing: number;
};

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
						<Modal
							__experimentalHideHeader
							onRequestClose={ () => setOverlay( { isOpen: false } ) }
							contentLabel={ __( 'Screenshot preview' ) }
						>
							<img
								style={ { width: '100%', height: 'auto' } }
								alt={ overlay.timing }
								src={ overlay.screenshot.data }
							/>
						</Modal>
					) }
					<HStack spacing={ 4 }>
						{ screenshots.map( ( screenshot, index ) => {
							const timing = `${ ( screenshot.timing / 1000 ).toFixed( 1 ) }s`;
							return (
								<VStack key={ index } spacing={ 2 } alignment="center">
									<Card>
										<Button
											variant="link"
											onClick={ () =>
												setOverlay( { isOpen: true, screenshot: screenshot, timing: timing } )
											}
											style={ {
												display: 'block',
												width: '100%',
											} }
											aria-label={ sprintf(
												/* translators: %s is the timing */
												__( 'View screenshot at %s' ),
												timing
											) }
										>
											<img
												style={ {
													display: 'block',
													width: '100%',
													borderRadius: '7px',
												} }
												alt={ timing }
												src={ screenshot.data }
											/>
										</Button>
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
