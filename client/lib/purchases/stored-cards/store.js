/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { getInitialState, reducer } from './reducer';

export default createReducerStore( reducer, getInitialState() );
