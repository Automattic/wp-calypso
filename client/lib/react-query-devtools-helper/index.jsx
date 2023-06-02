import config from '@automattic/calypso-config';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import ReactDom from 'react-dom';
import { setStoredItem, getStoredItem } from 'calypso/lib/browser-storage';

import './style.scss';

function useDevtoolsEnabled() {
	const [ devtoolsEnabled, setEnabled ] = useState( false );

	useEffect( () => {
		getStoredItem( 'enable-react-query-devtools' ).then( ( status ) =>
			setEnabled( status ?? false )
		);
	}, [] );

	const setDevtoolsEnabled = async ( status ) => {
		await setStoredItem( 'enable-react-query-devtools', status );
		setEnabled( status );
	};

	return [ devtoolsEnabled, setDevtoolsEnabled ];
}

export function CalypsoReactQueryDevtools() {
	const [ devtoolsEnabled ] = useDevtoolsEnabled();

	if ( config.isEnabled( 'dev/react-query-devtools' ) ) {
		return devtoolsEnabled ? <ReactQueryDevtools /> : null;
	}

	return null;
}

function ReactQueryDevtoolsHelper() {
	const [ devtoolsEnabled, setDevtoolsEnabled ] = useDevtoolsEnabled();

	async function toggleDevtools( event ) {
		await setDevtoolsEnabled( event.target.checked );
		window.location.reload();
	}

	return (
		<>
			<div>React Query</div>
			<div className="react-query-devtools-helper__popover">
				<label className="react-query-devtools-helper__label">
					<input
						type="checkbox"
						name="react-query-devtools"
						checked={ devtoolsEnabled }
						onChange={ toggleDevtools }
					/>
					<span>Enable Devtools</span>
				</label>
			</div>
		</>
	);
}

export default ( element ) => ReactDom.render( <ReactQueryDevtoolsHelper />, element );
