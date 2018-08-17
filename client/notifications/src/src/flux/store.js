/**
 * External dependencies
 */
import events from 'events';
const eventEmitter = new events.EventEmitter();

/**
 * Internal dependencies
 */
import { actions } from './constants';
import inputReducers from './input-reducers';

/**
 * Module variables
 */
const initialState = {
  input: {
    shortcutsAreEnabled: true,
  },
};
let state = { ...initialState };

function emitChange() {
  eventEmitter.emit('change');
}

function reduce(state, action) {
  var newState;

  switch (action.type) {
    case actions.SET_GLOBAL_DATA:
      newState = {
        ...state,
        global: action.data,
      };
      break;

    default:
      newState = state;
      break;
  }

  newState = inputReducers(newState, action);

  return newState;
}

export default {
  dispatch(action) {
    var oldState = state;

    state = reduce(state, action);

    if (oldState !== state) {
      emitChange();
    }
  },

  get(item) {
    if (item) {
      return state[item];
    }

    return state;
  },
};
