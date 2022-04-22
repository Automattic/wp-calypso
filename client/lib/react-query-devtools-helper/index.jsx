import config from '@automattic/calypso-config';
import { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { ReactQueryDevtools } from 'react-query/devtools';
import { setStoredItem, getStoredItem } from 'calypso/lib/browser-storage';

import './style.scss';

function useDevtoolsEnabled() {
	const [ enableDevtools, setEnableDevtools ] = useState();

	useEffect( () => {
		getStoredItem( 'enable-react-query-devtools' ).then( setEnableDevtools );
	}, [] );

	return enableDevtools;
}

export function CalypsoReactQueryDevtools() {
	const enableDevtools = useDevtoolsEnabled();

	if ( config.isEnabled( 'dev/react-query-devtools' ) ) {
		return enableDevtools ? <ReactQueryDevtools /> : null;
	}

	return null;
}

function ReactQueryDevtoolsHelper() {
	const enableDevtools = useDevtoolsEnabled();

	async function toggleDevtools( event ) {
		await setStoredItem( 'enable-react-query-devtools', event.target.checked );
		window.location.reload();
	}

	return (
		<>
			<div>ReactQuery</div>
			<div className="react-query-devtools-helper__popover">
				<label className="react-query-devtools-helper__label">
					<input
						type="checkbox"
						name="react-query-devtools"
						checked={ enableDevtools ?? false }
						onChange={ toggleDevtools }
					/>
					<span>Enable Devtools</span>
				</label>
			</div>
		</>
	);
}

export default ( element ) => ReactDom.render( <ReactQueryDevtoolsHelper />, element );
