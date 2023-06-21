import { INLINE_HELP_POPOVER_SHOW, INLINE_HELP_POPOVER_HIDE } from 'calypso/state/action-types';
import 'calypso/state/inline-help/init';

export function showInlineHelpPopover() {
	return {
		type: INLINE_HELP_POPOVER_SHOW,
	};
}

export function hideInlineHelpPopover() {
	return {
		type: INLINE_HELP_POPOVER_HIDE,
	};
}
