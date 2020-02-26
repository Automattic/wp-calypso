/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import LogItem from './components/log-item';
import { getCurrentUserName } from 'state/current-user/selectors';

export function jetpackCloud( context, next ) {
	context.primary = <div>Hi, this is the Jetpack.com Cloud!</div>;
	next();
}

export function jetpackBackups( context, next ) {
	context.primary = (
		<div>
			This is the Jetpack Backup landing page!
			<LogItem
				header="Unexpected core file: sx--a4bp.php"
				subheader="Threat found on 14 September, 2019"
			>
				<h3>Item Header</h3>
				<p>Foo</p>
				<h3>Item Header 2</h3>
				<p>Bar</p>
			</LogItem>
			<LogItem
				header="Unexpected core file: sx--a4bp.php"
				subheader="Threat found on 14 September, 2019"
				tag="critical"
				highlight="error"
			>
				Hello
			</LogItem>
		</div>
	);
	next();
}

export function jetpackScan( context, next ) {
	const state = context.store.getState();
	const currentUserName = getCurrentUserName( state );

	context.primary = (
		<div>
			<p>{ currentUserName ? `Hi, ${ currentUserName }!` : 'Hi!' }</p>
			<p>This is the Jetpack Scan landing page!</p>
		</div>
	);
	next();
}
