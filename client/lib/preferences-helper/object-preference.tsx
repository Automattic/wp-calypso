import { FunctionComponent } from 'react';
import BooleanPreference from './boolean-preference';
import NumberPreference from './number-preference';
import StringPreference from './string-preference';

interface Props {
	name: string;
	value: any;
}

const ObjectPreference: FunctionComponent< Props > = ( { value } ) => {
	const renderProperty = ( key: string, value: any ) => {
		switch ( typeof value ) {
			case 'number':
				return <NumberPreference name={ key } value={ value } />;
			case 'string':
				return <StringPreference name={ key } value={ value } />;
			case 'boolean':
				return <BooleanPreference name={ key } value={ value } />;
			case 'object':
				if ( ! Array.isArray( value ) ) {
					return <ObjectPreference name={ key } value={ value } />;
				}
			default:
				return key + ': ' + JSON.stringify( value );
		}
	};

	return (
		<ul className="preferences-helper__list">
			{ value &&
				Object.keys( value ).map( ( property ) => (
					<li key={ property }>
						<span>{ property }</span>
						{ renderProperty( property, value[ property ] ) }
					</li>
				) ) }
		</ul>
	);
};

export default ObjectPreference;
