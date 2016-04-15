/**
 * External Dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal Dependencies
 */
import Layout from 'layout';
import layoutFocus from 'lib/layout-focus';
import nuxWelcome from 'nux-welcome';
import translatorInvitation from 'layout/community-translator/invitation-utils';
var user = require( 'lib/user' )(),
	sites = require( 'lib/sites-list' )();

export { makeLoggedOutLayout } from './index.node.js';
export { clientRouter } from './index.node.js';
export { setSection } from './index.node.js';

export function makeLayout( context, next ) {
	const { store, primary, secondary, tertiary } = context;

	context.layout = (
		<ReduxWrappedLayout store={ store }
			primary={ primary }
			secondary={ secondary }
			tertiary={ tertiary }
		/>
	);
	next();
};

export const ReduxWrappedLayout = ( { store, primary, secondary, tertiary } ) => (
	<ReduxProvider store={ store }>
		{ user.get()
			? <Layout primary={ primary }
				secondary={ secondary }
				tertiary={ tertiary }
				user={ user }
				sites={ sites }
				focus={ layoutFocus }
				nuxWelcome={ nuxWelcome }
				translatorInvitation={ translatorInvitation }
			/>
			: <Layout focus={ layoutFocus } />
		}
	</ReduxProvider>
);
