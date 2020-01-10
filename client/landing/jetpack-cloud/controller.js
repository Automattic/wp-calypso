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
import JetpackCloudSidebar from './sidebar';

export const makeLayout = ( context, next ) => {
	const { store, primary, secondary } = context;

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
	context.secondary = <JetpackCloudSidebar />;
	next();
}

export function jetpackCloud( context, next ) {
	context.primary = <div>Hi, this is the Jetpack.com Cloud!</div>;
	next();
}

export function jetpackBackups( context, next ) {
	context.primary = <div>This is the Jetpack Backup landing page!</div>;
	next();
}

export function jetpackScan( context, next ) {
	context.primary = <div>This is the Jetpack Scan landing page!</div>;
	next();
}
