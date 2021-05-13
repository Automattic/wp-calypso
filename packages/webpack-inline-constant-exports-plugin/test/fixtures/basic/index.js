/**
 * Internal dependencies
 */
import { PLANS_REQUEST, PLANS_RECEIVE } from './actions';
import ALL_PLANS, { BLOGGER, PREMIUM } from './plans';
import THE_ANSWER, { PI, YES, NO, NULL } from './constants';
import { HOME_PATH } from './paths';
import { FOO } from './export';

/* eslint-disable no-console */
console.log( PLANS_REQUEST, PLANS_RECEIVE );
console.log( BLOGGER, PREMIUM, ALL_PLANS );
console.log( THE_ANSWER, PI, YES, NO, NULL );
console.log( HOME_PATH );
console.log( FOO );
