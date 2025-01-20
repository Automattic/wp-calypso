import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, KeyboardEvent, useCallback } from 'react';
import ModalLinkIcon from 'calypso/assets/images/jetpack/jetpack-icon-modal-link.svg';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

type Props = {
	productName: string;
	customText?: string;
	onClick: ( e: React.MouseEvent< HTMLElement > ) => void;
	showIcon?: boolean;
};

const LicenseLightboxLink: FunctionComponent< Props > = ( {
	productName,
	customText,
	onClick,
	showIcon = true,
} ) => {
	const translate = useTranslate();

	const onKeyDown = useCallback( ( e: KeyboardEvent< HTMLButtonElement > ) => {
		e.stopPropagation();
	}, [] );

	// In this specific context, not wrapping between words in a product name
	// gives us a more readable, professional look
	const noWrapProductName = <>{ preventWidows( productName, Infinity ) }</>;

	return (
		<Button className="license-lightbox-link" plain onClick={ onClick } onKeyDown={ onKeyDown }>
			<span className="license-lightbox-link__text">
				{ customText
					? customText
					: translate( 'More about {{productName/}}', {
							components: { productName: noWrapProductName },
					  } ) }
			</span>

			{ showIcon && <img className="license-lightbox-link-icon" src={ ModalLinkIcon } alt="" /> }
		</Button>
	);
};

export default LicenseLightboxLink;
