/**
 * External dependencies
 */
import { map } from 'lodash';

export enum Step {
	IntentGathering = '/',
	DesignSelection = '/design',
	PageSelection = '/pages',
	Signup = '/signup',
}

export const routes = `(${ map( Step, ( route: string ) => route ).join( '|' ) })`;
