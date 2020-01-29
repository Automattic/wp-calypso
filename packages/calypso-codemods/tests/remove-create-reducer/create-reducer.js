// This comment should be preserved even if the line below is removed.
import { createReducer, createReducerWithValidation } from 'state/utils';

const COMPUTED_IDENTIFIER = 'COMPUTED_IDENTIFIER';

const isFetchingSettings = createReducer( false, {
	[ COMPUTED_IDENTIFIER ]: () => 'computed_id',
	[ 'COMPUTED_STRING' ]: state => state,
	NON_COMPUTED_STRING: ( state, action ) => action.thing,
	2: () => 2,
	FUNCTION_HANDLER: function( s, a ) {
		return s;
	},
	ARROW_FUNCTION_HANDLER: ( state, action ) => state,
	ARROW_FUNCTION_WITH_DESTRUCT: ( state, { thing } ) => thing,
	VARIABLE_HANDLER: f,
} );

function f() {
	return 'a function reducer';
}

const persistentReducer = createReducer( false, {
	[ COMPUTED_IDENTIFIER ]: () => 'computed_id',
	[ 'SERIALIZE' ]: state => state,
} );

export const exportedPersistentReducer = createReducer( false, {
	[ COMPUTED_IDENTIFIER ]: () => 'computed_id',
	[ 'SERIALIZE' ]: state => state,
} );

const persistentReducerArray = [];
reducerArray[ 0 ] = createReducer( false, {
	[ COMPUTED_IDENTIFIER ]: () => 'computed_id',
	[ 'DESERIALIZE' ]: state => state,
} );

const persistentReducerObj = {
	key: createReducer( false, {
		[ COMPUTED_IDENTIFIER ]: () => 'computed_id',
		[ 'DESERIALIZE' ]: state => state,
	} ),
};

const validatedReducer = createReducerWithValidation(
	false,
	{
		[ COMPUTED_IDENTIFIER ]: () => 'computed_id',
	},
	schema
);
