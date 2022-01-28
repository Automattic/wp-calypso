import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import ResizableIframe from 'calypso/components/resizable-iframe';

import './dialog.scss';

function InlineHelpDialog( { videoLink, onClose } ) {
	const translate = useTranslate();

	const dialogButtons = [
		<Button onClick={ onClose }>{ translate( 'Close', { textOnly: true } ) }</Button>,
	];

	// Replace youtube.com links with the embeddable version that can be iframed.
	const videoEmbedLink = videoLink.replace( 'youtube.com/watch?v=', 'youtube.com/embed/' );

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Dialog
			additionalClassNames="inline-help__richresult__dialog"
			isVisible
			buttons={ dialogButtons }
			onCancel={ onClose }
			onClose={ onClose }
		>
			<div className="inline-help__richresult__dialog__video">
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
		</Dialog>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default InlineHelpDialog;
