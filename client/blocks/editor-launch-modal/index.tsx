/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Launch from '@automattic/launch';

/**
 * Style dependencies
 */
import './style.scss';

const EditorLaunchModal: React.FunctionComponent = () => {
	const [ isClosed, setIsClosed ] = React.useState( false );

	const handleClose = () => {
		setIsClosed( true );
	};

	return (
		<div className="editor-launch-modal" hidden={ isClosed }>
			<Launch onClose={ handleClose }></Launch>
		</div>
	);
};

export default EditorLaunchModal;
