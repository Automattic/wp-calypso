import {
	__experimentalHStack as HStack,
	__experimentalScrollable as Scrollable,
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
	const [ selectedScreenshot, setSelectedScreenshot ] = useState< OverlayState >( {
		isOpen: false,
	} );
	if ( ! screenshots || ! screenshots.length ) {
		return null;
	}

	return (
		<Card>
			<CardBody style={ { paddingInlineEnd: '0' } }>
				<VStack spacing={ 4 }>
					<Text size={ 15 } weight={ 500 } as="h2">
						{ __( 'Page load timeline' ) }
					</Text>
					{ selectedScreenshot.isOpen && selectedScreenshot.screenshot && (
						<Modal
							__experimentalHideHeader
							onRequestClose={ () => setSelectedScreenshot( { isOpen: false } ) }
							contentLabel={ __( 'Screenshot preview' ) }
						>
							<img
								style={ { width: '100%', height: 'auto' } }
								alt={ selectedScreenshot.timing }
								src={ selectedScreenshot.screenshot.data }
							/>
						</Modal>
					) }
					<Scrollable scrollDirection="x">
						<HStack spacing={ 4 } justify="flex-start">
							{ screenshots.map( ( screenshot, index ) => {
								const timing = `${ ( screenshot.timing / 1000 ).toFixed( 1 ) }s`;
								return (
									<VStack
										style={ {
											width: '100px',
											flexShrink: 0,
											padding: '2px', // Accomodate button focus box-shadow
											paddingInlineEnd: index === screenshots.length - 1 ? '16px' : '0',
										} }
										key={ index }
										spacing={ 2 }
										alignment="center"
									>
										<Card>
											<Button
												variant="link"
												onClick={ () =>
													setSelectedScreenshot( {
														isOpen: true,
														screenshot: screenshot,
														timing: timing,
													} )
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
					</Scrollable>
				</VStack>
			</CardBody>
		</Card>
	);
}
