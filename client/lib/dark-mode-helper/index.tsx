import { type ChangeEvent, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
	isColorScheme,
	readStoredColorScheme,
	updateColorSchemePreference,
	type ColorScheme,
} from 'calypso/lib/color-scheme';

import './style.scss';

const COLOR_SCHEMES = [
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'system', label: 'Auto' },
] as const;

function DarkModeHelper() {
	const [ colorScheme, setColorScheme ] = useState< ColorScheme >( readStoredColorScheme );

	const updateColorScheme = ( event: ChangeEvent< HTMLInputElement > ) => {
		const { value } = event.currentTarget;
		if ( isColorScheme( value ) ) {
			setColorScheme( value );
			updateColorSchemePreference( value );
		}
	};

	return (
		<>
			<div>Theme: { COLOR_SCHEMES.find( ( { value } ) => value === colorScheme )?.label }</div>
			<div className="dark-mode-helper__popover">
				{ COLOR_SCHEMES.map( ( { value, label } ) => (
					<label className="dark-mode-helper__label" key={ value }>
						<input
							type="radio"
							name="dashboard-theme"
							value={ value }
							checked={ colorScheme === value }
							onChange={ updateColorScheme }
						/>
						{ label }
					</label>
				) ) }
			</div>
		</>
	);
}

export default ( element: HTMLElement ) => createRoot( element ).render( <DarkModeHelper /> );
