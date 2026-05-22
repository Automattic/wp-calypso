import { Button } from '@wordpress/components';
import { edit } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useComposer } from '../composer-provider';

/**
 * Floating Action Button that opens the composer in standalone mode.
 *
 * Stays mounted at all times — when a composer mode is active we hide it
 * with `aria-hidden` + `tabIndex={ -1 }` and an `is-hidden` class for
 * CSS-driven visibility. Unmounting would detach the trigger DOM node
 * referenced by `<ComposerProvider>`'s `triggerRef`, which silently breaks
 * focus restoration after the modal closes.
 */
export function ComposeFab() {
	const translate = useTranslate();
	const { mode, openComposer } = useComposer();
	const isHidden = mode != null;

	return (
		<Button
			variant="primary"
			className={ clsx( 'social-compose-fab', { 'is-hidden': isHidden } ) }
			icon={ edit }
			text={ translate( 'Compose' ) as string }
			aria-hidden={ isHidden || undefined }
			tabIndex={ isHidden ? -1 : undefined }
			onClick={ () => openComposer( { kind: 'standalone', entry_point: 'fab' } ) }
		/>
	);
}
