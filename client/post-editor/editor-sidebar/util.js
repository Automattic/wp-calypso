/**
 * External dependencies
 */
import { PropTypes } from 'react';

export const CHILD_SIDEBAR_NONE = 'CHILD_SIDEBAR_NONE';
export const CHILD_SIDEBAR_REVISIONS = 'CHILD_SIDEBAR_REVISIONS';

export const ChildSidebarPropTypes = PropTypes.oneOf( [
	CHILD_SIDEBAR_NONE,
	CHILD_SIDEBAR_REVISIONS,
] );
