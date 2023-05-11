import { useTranslate } from 'i18n-calypso';
import { Dialog } from '@automattic/components';

import './style.scss';

function ReaderRecommendedFollowsDialog( { onClose } ) {
	const translate = useTranslate();
	return (
		<Dialog
			additionalClassNames="reader-recommended-follows-dialog"
			isBackdropVisible={ true }
			isVisible={ true }
			onClose={ onClose }
			showCloseIcon={ true }
		>
			<div className="reader-recommended-follows-dialog__content">
				<div className="reader-recommended-follows-dialog__header">
					<h2 className="reader-recommended-follows-dialog__title">
						{ translate( 'Recommended follows' ) }
					</h2>
					<p className="reader-recommended-follows-dialog__description">
						{ translate( "While you're at it, you might as well check out these sites" ) }
					</p>
				</div>
				<div className="reader-recommended-follows-dialog__body">
					<div className="reader-recommended-follows-dialog__follow">sdf</div>
				</div>
			</div>
		</Dialog>
	);
}

export default ReaderRecommendedFollowsDialog;
