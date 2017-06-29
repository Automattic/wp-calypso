/**
 * External dependencies
 */
import { PropTypes } from 'react';

export const NESTED_SIDEBAR_NONE = 'NESTED_SIDEBAR_NONE';
export const NESTED_SIDEBAR_REVISIONS = 'NESTED_SIDEBAR_REVISIONS';

export const NestedSidebarPropType = PropTypes.oneOf( [
	NESTED_SIDEBAR_NONE,
	NESTED_SIDEBAR_REVISIONS,
] );
