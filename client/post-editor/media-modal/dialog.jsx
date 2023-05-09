import { Dialog } from '@automattic/components';
import classNames from 'classnames';
import './dialog.scss';

export default ( { additionalClassNames, ...props } ) => (
	<Dialog
		additionalClassNames={ classNames( 'editor-media-modal', additionalClassNames ) }
		{ ...props }
	/>
);
