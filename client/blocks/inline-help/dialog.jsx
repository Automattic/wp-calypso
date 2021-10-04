import { Button, Dialog } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import ResizableIframe from 'calypso/components/resizable-iframe';

import './dialog.scss';

function InlineHelpDialog( { dialogType, videoLink, onClose } ) {
	const translate = useTranslate();

	/* @TODO: This class is not valid and this tricks the linter
	 * fix this class and fix the linter to catch similar instances.
	 */
	const iframeClasses = classNames( 'inline-help__richresult__dialog__video' );
	const dialogClasses = classNames( 'inline-help__richresult__dialog', dialogType );

	const dialogButtons =
		dialogType === 'video'
			? [ <Button onClick={ onClose }>{ translate( 'Close', { textOnly: true } ) }</Button> ]
			: [];

	// Replace youtube.com links with the embeddable version that can be iframed.
	const videoEmbedLink = videoLink.replace( 'youtube.com/watch?v=', 'youtube.com/embed/' );

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
						src={ videoEmbedLink + '?rel=0&amp;showinfo=0&amp;autoplay=1' }
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

export default InlineHelpDialog;
