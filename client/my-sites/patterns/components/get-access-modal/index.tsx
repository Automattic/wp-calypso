import { Button, Dialog } from '@automattic/components';
import { useLocalizeUrl, useLocale } from '@automattic/i18n-utils';
import { Icon, close as iconClose } from '@wordpress/icons';

import './style.scss';

type PatternsGetAccessModalProps = {
	isOpen: boolean;
	onClose: () => void;
};

export const PatternsGetAccessModal = ( { isOpen, onClose }: PatternsGetAccessModalProps ) => {
	const locale = useLocale();
	const localizeUrl = useLocalizeUrl();

	const isLoggedIn = false;
	const startUrl = localizeUrl( '//wordpress.com/start/account/user', locale, isLoggedIn );
	const loginUrl = localizeUrl( '//wordpress.com/log-in', locale, isLoggedIn );

	return (
		<Dialog
			isVisible={ isOpen }
			additionalClassNames="patterns-get-access-modal"
			additionalOverlayClassNames="patterns-get-access-modal__backdrop"
			onClose={ onClose }
		>
			<div className="patterns-get-access-modal__content">
				<button className="patterns-get-access-modal__close" onClick={ onClose }>
					<Icon icon={ iconClose } size={ 24 } />
				</button>
				<div className="patterns-get-access-modal__inner">
					<div className="patterns-get-access-modal__title">Unlock the full pattern library</div>
					<div className="patterns-get-access-modal__description">
						Build sites faster using hundreds of professionally designed layouts. All you need's a
						WordPress.com account to get started.
					</div>
					<div className="patterns-get-access-modal__upgrade-buttons">
						<Button primary href={ startUrl }>
							Create a free account
						</Button>
						<Button transparent href={ loginUrl }>
							Log in
						</Button>
					</div>
				</div>
			</div>
		</Dialog>
	);
};
