/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import ResizableIframe from 'calypso/components/resizable-iframe';

/**
 * Style dependencies
 */
import './dialog.scss';

function InlineHelpDialog( { dialogType, videoLink, onClose, translate } ) {
	/* @TODO: This class is not valid and this tricks the linter
	 * fix this class and fix the linter to catch similar instances.
	 */
	const iframeClasses = classNames( 'inline-help__richresult__dialog__video' );
	const dialogClasses = classNames( 'inline-help__richresult__dialog', dialogType );

	const dialogButtons =
		dialogType === 'video'
			? [ <Button onClick={ onClose }>{ translate( 'Close', { textOnly: true } ) }</Button> ]
			: [];

	return (
		<Dialog
			additionalClassNames={ dialogClasses }
			isVisible
			buttons={ dialogButtons }
			onCancel={ onClose }
			onClose={ onClose }
		>
			{ dialogType === 'video' && (
				<div className={ iframeClasses }>
					<ResizableIframe
						src={ videoLink + '?rel=0&amp;showinfo=0&amp;autoplay=1' }
						frameBorder="0"
						seamless
						allowFullScreen
						autoPlay
						width="640"
						height="360"
					/>
				</div>
			) }
		</Dialog>
	);
}

export default localize( InlineHelpDialog );
