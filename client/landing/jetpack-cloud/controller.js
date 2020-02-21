/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal Dependencies
 */
import JetpackCloudLayout from './layout';
import JetpackCloudSidebar from './components/sidebar';
import LogItem from './components/log-item';

export const makeLayout = ( context, next ) => {
	const { primary, secondary, store } = context;

	context.layout = (
		<ReduxProvider store={ store }>
			<JetpackCloudLayout primary={ primary } secondary={ secondary } />
		</ReduxProvider>
	);

	next();
};

export const clientRender = context => {
	ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );
};

export function setupSidebar( context, next ) {
	context.secondary = <JetpackCloudSidebar path={ context.path } />;
	next();
}