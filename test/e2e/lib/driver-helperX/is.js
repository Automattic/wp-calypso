/**
 * Internal dependencies
 */
import { resolveToBool } from './utils';
import { findElement, findVisibleElement, findClickableElement, findFocusedElement } from './find';

export function elementLocated( driver, locator ) {
	return resolveToBool( findElement( driver, locator ) );
}
export function elementNotLocated( driver, locator ) {
	return resolveToBool( findElement( driver, locator ) ).then( ( v ) => ! v );
}
export function elementLocatedAndVisible( driver, locator ) {
	return resolveToBool( findVisibleElement( driver, locator ) );
}
export function elementClickable( driver, locator ) {
	return resolveToBool( findClickableElement( driver, locator ) );
}
export async function elementFocused( driver, locator ) {
	return resolveToBool( findFocusedElement( driver, locator ) );
}
export function linkFollowable() {
	return null;
}
export function fieldClearable() {
	return null;
}
export function fieldSettable() {
	return null;
}
export function imageVisible() {
	return null;
}
export function lazyListLoaded() {
	return null;
}
export function windowReady() {
	return null;
}
export function popupClosed() {
	return null;
}
export function alertDisplayed() {
	return null;
}
