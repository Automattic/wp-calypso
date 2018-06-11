/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import GoogleMyBusinessEnterAddress from './enter-address';
import GoogleMyBusinessNewAccount from './new-account';
import GoogleMyBusinessSelectBusinessType from './select-business-type';
import GoogleMyBusinessSelectLocation from './select-location';
import GoogleMyBusinessStats from './stats';

export function enterAddress( context, next ) {
	context.primary = <GoogleMyBusinessEnterAddress />;

	next();
}

export function newAccount( context, next ) {
	context.primary = <GoogleMyBusinessNewAccount />;

	next();
}

export function selectBusinessType( context, next ) {
	context.primary = <GoogleMyBusinessSelectBusinessType />;

	next();
}

export function selectLocation( context, next ) {
	context.primary = <GoogleMyBusinessSelectLocation />;

	next();
}

export function stats( context, next ) {
	context.primary = <GoogleMyBusinessStats />;

	next();
}
