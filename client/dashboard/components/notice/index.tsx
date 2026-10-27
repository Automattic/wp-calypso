import { Notice as UINotice } from '@wordpress/ui';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { caution } from './icons';
import type { NoticeProps } from './types';
import './style.scss';

/**
 * The Notice component is a visually non-obtrusive element that communicates the system status
 * and provides options and actions related to the message tone.
 *
 * This component is designed to sit inline with the page area and capture the user’s attention
 * to inform them about relevant information.
 *
 * It's a thin wrapper around the `Notice` from `@wordpress/ui`.
 *
 * ```jsx
 * import { Notice } from '@automattic/components';
 * import { ExternalLink } from '@wordpress/components';
 *
 * function MyComponent() {
 * 	return (
 * 		<Notice
 * 			title="Title"
 * 			actions={ <Button variant="primary">Label</Button> }
 * 		>
 * 			<>Hello, I’m a notice with an inline <ExternalLink href="#">link</ExternalLink></>
 * 		</Notice>
 * 	);
 * }
 * ```
 */
function UnforwardedNotice(
	{ variant = 'info', title, children, actions, onClose, icon }: NoticeProps,
	ref: React.ForwardedRef< HTMLDivElement >
) {
	return (
		<UINotice.Root
			ref={ ref }
			className={ clsx( 'dashboard-notice', `is-${ variant }` ) }
			intent={ variant }
			icon={ icon === undefined && variant === 'warning' ? caution : icon }
			// Most dashboard notices are static page content, so don't announce them on mount.
			spokenMessage={ null }
		>
			{ title && <UINotice.Title>{ title }</UINotice.Title> }
			{ children && <UINotice.Description render={ <div /> }>{ children }</UINotice.Description> }
			{ actions && <UINotice.Actions>{ actions }</UINotice.Actions> }
			{ !! onClose && <UINotice.CloseIcon onClick={ onClose } /> }
		</UINotice.Root>
	);
}

export const Notice = forwardRef( UnforwardedNotice );

export default Notice;
