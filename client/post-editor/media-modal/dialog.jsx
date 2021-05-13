/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';

/**
 * Style dependencies
 */
import './dialog.scss';

export default ( { additionalClassNames, ...props } ) => (
	<Dialog
		additionalClassNames={ classNames( 'editor-media-modal', additionalClassNames ) }
		{ ...props }
	/>
);
