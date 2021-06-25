/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { pSoup } from './functions';

export const Preface = ( { blocks } ) => <div className="wpnc__preface">{ pSoup( blocks ) }</div>;

export default Preface;
