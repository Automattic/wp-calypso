import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import ModalLinkIcon from 'calypso/assets/images/jetpack/jetpack-icon-modal-link.svg';

import './style.scss';

type Props = {
	productName: string;
	onClick: ( e: React.MouseEvent< HTMLElement > ) => void;
};

const LicenseLightboxLink: FunctionComponent< Props > = ( { productName, onClick } ) => {
	const translate = useTranslate();

	return (
		<Button className="license-lightbox-link" plain onClick={ onClick }>
			{ translate( 'More about {{productName/}}', {
				components: { productName: <>{ productName }</> },
			} ) }

			<img className="license-lightbox-link-icon" src={ ModalLinkIcon } alt="" />
		</Button>
	);
};

export default LicenseLightboxLink;
