/**
 * External Dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

export { makeLoggedOutLayout } from './index.node.js';
export { clientRouter } from './index.node.js';
export { setSection } from './index.node.js';

export function makeLayout( context, next ) {
	const { store, primary, secondary, tertiary } = context;
	const { user, sites, focus, nuxWelcome, translationInvitation } = context;
	const Layout = context.layoutComponent;

	context.layout = (
		<ReduxProvider store={ store }>
			<Layout primary={ primary }
				secondary={ secondary }
				tertiary={ tertiary }
				user={ user }
				sites={ sites }
				focus={ focus }
				nuxWelcome={ nuxWelcome }
				translationInvitation={ translationInvitation }
			/>
		</ReduxProvider>
	);
	next();
};
