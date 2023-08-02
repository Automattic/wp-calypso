import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import ModalLinkIcon from 'calypso/assets/images/jetpack/jetpack-icon-modal-link.svg';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

type Props = {
	productName: string;
	onClick: ( e: React.MouseEvent< HTMLElement > ) => void;
};

const LicenseLightboxLink: FunctionComponent< Props > = ( { productName, onClick } ) => {
	const translate = useTranslate();

	// In this specific context, not wrapping between words in a product name
	// gives us a more readable, professional look
	const noWrapProductName = <>{ preventWidows( productName, Infinity ) }</>;

	return (
		<Button className="license-lightbox-link" plain onClick={ onClick }>
			<span className="license-lightbox-link__text">
				{ translate( 'More about {{productName/}}', {
					components: { productName: noWrapProductName },
				} ) }
			</span>

			<img className="license-lightbox-link-icon" src={ ModalLinkIcon } alt="" />
		</Button>
	);
};

export default LicenseLightboxLink;
