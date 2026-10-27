import {
	Button,
	Popover,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { translate, useRtl } from 'i18n-calypso';

import './style.scss';

type SelfOnlyNudgeProps = {
	anchor: HTMLElement | null;
	isNarrow: boolean;
	onDismiss: () => void;
};

/**
 * Points a creator at the "Add subscribers" button when their own subscription is the only one on
 * the site. Waits to be acknowledged rather than closing itself, so it can't vanish before it has
 * been read.
 */
const SelfOnlyNudge = ( { anchor, isNarrow, onDismiss }: SelfOnlyNudgeProps ) => {
	const isRtl = useRtl();

	const handleDismiss = useCallback( () => {
		onDismiss();
		anchor?.focus();
	}, [ anchor, onDismiss ] );

	if ( ! anchor ) {
		return null;
	}

	const inlineStartPlacement = isRtl ? 'right-start' : 'left-start';

	return (
		<Popover
			anchor={ anchor }
			placement={ isNarrow ? 'bottom-end' : inlineStartPlacement }
			offset={ 8 }
			noArrow={ false }
			resize={ false }
			focusOnMount={ false }
			onClose={ handleDismiss }
			onFocusOutside={ onDismiss }
			role="status"
			className="subscribers-self-only-nudge"
		>
			<VStack className="subscribers-self-only-nudge__body" alignment="topLeft" spacing={ 3 }>
				<Heading level={ 3 } size={ 16 }>
					{ translate( 'Every newsletter starts at one' ) }
				</Heading>
				<Text as="p">
					{ translate(
						'Yours is no exception. Add a few people who already know you: {{em}}friends, family, coworkers{{/em}}.',
						{ components: { em: <em /> } }
					) }
				</Text>
				<Button size="compact" variant="secondary" onClick={ handleDismiss }>
					{ translate( 'Got it', { context: 'dismiss button' } ) }
				</Button>
			</VStack>
		</Popover>
	);
};

export default SelfOnlyNudge;
