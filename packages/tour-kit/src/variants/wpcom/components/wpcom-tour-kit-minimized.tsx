import { Button, Flex } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import maximize from '../icons/maximize';
import type { MinimizedTourRendererProps } from '../../../types';

const WpcomTourKitMinimized: React.FunctionComponent< MinimizedTourRendererProps > = ( {
	steps,
	onMaximize,
	onDismiss,
	currentStepIndex,
} ) => {
	const lastStepIndex = steps.length - 1;
	const page = currentStepIndex + 1;
	const numberOfPages = lastStepIndex + 1;

	return (
		<Flex gap={ 0 } className="wpcom-tour-kit-minimized">
			<Button onClick={ onMaximize } aria-label={ __( 'Resume Tour' ) }>
				<Flex gap={ 13 }>
					<p>
						{ createInterpolateElement(
							sprintf(
								/* translators: 1: current page number, 2: total number of pages */
								__( 'Resume tour <span>(%1$d/%2$d)</span>' ),
								page,
								numberOfPages
							),
							{
								span: <span className="wpcom-tour-kit-minimized__tour-index" />,
							}
						) }
					</p>
					<Icon icon={ maximize } size={ 24 } />
				</Flex>
			</Button>
			<Button onClick={ onDismiss( 'close-btn-minimized' ) } aria-label={ __( 'Close Tour' ) }>
				<Icon icon={ close } size={ 24 } />
			</Button>
		</Flex>
	);
};

export default WpcomTourKitMinimized;
