import { useMemo } from '@wordpress/element';
import { convertToSnakeCase } from 'calypso/state/data-layer/utils';

interface Params {
	input?: Record< string, unknown >;
}

const useSnakeCasedKeys = ( { input }: Params ) => {
	return useMemo( () => input && ( convertToSnakeCase( input ) as Params[ 'input' ] ), [ input ] );
};

export default useSnakeCasedKeys;
