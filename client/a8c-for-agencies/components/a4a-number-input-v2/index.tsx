import { Button, TextControl } from '@wordpress/components';
import { Icon, lineSolid, plus } from '@wordpress/icons';
import { useCallback, useEffect, useRef, useState } from 'react';

import './style.scss';

type Props = {
	value: number;
	onChange: ( value: number ) => void;
	minimum?: number;
	maximum?: number;
	increment?: number;
};

export default function A4ANumberInputV2( {
	value,
	onChange,
	minimum = 1,
	maximum,
	increment = 1,
}: Props ) {
	const inputRef = useRef< HTMLInputElement >( null );
	const [ dirtyValue, setDirtyValue ] = useState( '' );

	const onDecrement = useCallback( () => {
		onChange( Math.max( value - increment, minimum ) );
	}, [ increment, minimum, onChange, value ] );

	const onIncrement = useCallback( () => {
		onChange( maximum ? Math.min( value + increment, maximum ) : value + increment );
	}, [ increment, maximum, onChange, value ] );

	const onBlur = useCallback( () => {
		const next = Number( dirtyValue );
		if ( ! isNaN( next ) && next >= minimum && ( ! maximum || next <= maximum ) ) {
			onChange( next );
		} else {
			setDirtyValue( `${ value }` );
		}
	}, [ dirtyValue, maximum, minimum, onChange, value ] );

	useEffect( () => {
		setDirtyValue( `${ value }` );
	}, [ value ] );

	return (
		<div className="a4a-number-input-v2">
			<TextControl
				ref={ inputRef }
				value={ dirtyValue }
				onChange={ ( newValue ) => setDirtyValue( newValue ) }
				onBlur={ onBlur }
				onFocus={ () => inputRef.current?.select() }
				type="number"
			/>
			<Button onMouseDown={ onIncrement }>
				<Icon icon={ plus } size={ 18 } />
			</Button>
			<Button onMouseDown={ onDecrement }>
				<Icon icon={ lineSolid } size={ 18 } />
			</Button>
		</div>
	);
}
