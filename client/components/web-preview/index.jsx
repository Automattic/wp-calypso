/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';

export default props => <AsyncLoad { ...props } require="components/web-preview/component" />;
