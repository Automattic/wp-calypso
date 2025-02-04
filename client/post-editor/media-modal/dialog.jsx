import { Dialog } from '@automattic/components';
import clsx from 'clsx';
import './dialog.scss';

export default ( { additionalClassNames, ...props } ) => (
	<Dialog
		additionalClassNames={ clsx( 'editor-media-modal', additionalClassNames ) }
		{ ...props }
	/>
);
