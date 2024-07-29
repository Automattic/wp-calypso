import { Button, TextControl } from '@wordpress/components';
import { Icon, lineSolid, plus } from '@wordpress/icons';
import { useCallback } from 'react';

import './style.scss';

type Props = {
	value: number;
	onChange: ( value: number ) => void;
	minimum?: number;
	maximum?: number;
	increment?: number;
};

export default function A4ANumberInput( {
	value,
	onChange,
	minimum = 1,
	maximum,
	increment = 1,
}: Props ) {
	const onDecrement = useCallback( () => {
		onChange( Math.max( value - increment, minimum ) );
	}, [ increment, minimum, onChange, value ] );

	const onIncrement = useCallback( () => {
		onChange( maximum ? Math.min( value + increment, maximum ) : value + increment );
	}, [ increment, maximum, onChange, value ] );

	return (
		<div className="a4a-number-input">
			<Button onMouseDown={ onDecrement }>
				<Icon className="gridicon" icon={ lineSolid } size={ 18 } />
			</Button>
			<TextControl
				value={ value }
				onChange={ ( newValue ) => onChange( parseInt( newValue, 10 ) ) }
				type="number"
			/>
			<Button onMouseDown={ onIncrement }>
				<Icon className="gridicon" icon={ plus } size={ 18 } />
			</Button>
		</div>
	);
}
