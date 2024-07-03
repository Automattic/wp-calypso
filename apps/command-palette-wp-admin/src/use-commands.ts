import { useCommands } from '@automattic/command-palette';
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
	const commands = useCommands();
	commands.getHelp.callback = ( { close }: CommandCallBackParams ) => {
		close();
		waitForElementAndClick( '#wp-admin-bar-help-center' );
	};

	return Object.values( commands ) as Command[];
};
