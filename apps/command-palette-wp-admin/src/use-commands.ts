import { COMMANDS } from '@automattic/command-palette';
import type { Command, CommandCallBackParams } from '@automattic/command-palette';

const waitForElementAndClick = ( selector: string, attempt = 1 ) => {
	const element = document.querySelector< HTMLElement >( selector );
	if ( element ) {
		element.click();
	} else if ( attempt <= 5 ) {
		// Try again in 250ms, but no more than 5 times.
		setTimeout( () => waitForElementAndClick( selector, attempt + 1 ), 250 );
	}
};

export const useCommandsWpAdmin = (): Command[] => {
	// Only override commands that need a specific behavior for WP Admin.
	// Commands need to be defined in `packages/command-palette/src/commands.tsx`.
	COMMANDS.getHelp.callback = ( { close }: CommandCallBackParams ) => {
		close();
		waitForElementAndClick( '#wp-admin-bar-help-center' );
	};
	COMMANDS.sendFeedback.callback = ( { close }: CommandCallBackParams ) => {
		close();
		waitForElementAndClick( '#wp-admin-bar-help-center' );
		waitForElementAndClick( '.help-center-contact-page__button' );
		waitForElementAndClick( '.help-center-contact-page__box.email' );
	};

	return Object.values( COMMANDS ) as Command[];
};
