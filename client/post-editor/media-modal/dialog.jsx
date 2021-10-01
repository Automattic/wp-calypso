import { Dialog } from '@automattic/components';
import classNames from 'classnames';
import React from 'react';
import './dialog.scss';

export default ( { additionalClassNames, ...props } ) => (
	<Dialog
		additionalClassNames={ classNames( 'editor-media-modal', additionalClassNames ) }
		{ ...props }
	/>
);
