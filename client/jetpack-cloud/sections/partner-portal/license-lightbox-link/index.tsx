import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import ModalLinkIcon from 'calypso/assets/images/jetpack/jetpack-icon-modal-link.svg';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import LicenseLightbox from '../license-lightbox';
import { getProductTitle } from '../utils';

import './style.scss';

type Props = {
	product: APIProductFamilyProduct;
};

const LicenseLightboxLink: FunctionComponent< Props > = ( { product } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ showLightbox, setShowLightbox ] = useState( false );

	const onShowLightbox = useCallback(
		( e: React.MouseEvent< HTMLElement > ) => {
			e.stopPropagation();

			dispatch(
				recordTracksEvent( 'calypso_partner_portal_issue_license_product_view', {
					product: product.slug,
				} )
			);

			setShowLightbox( true );
		},
		[ dispatch, product ]
	);

	const onHideLightbox = useCallback( () => {
		setShowLightbox( false );
	}, [] );

	const productTitle = getProductTitle( product.name );

	return (
		<>
			<Button className="license-lightbox-link" onClick={ onShowLightbox } plain>
				{ translate( 'More about {{productName/}}', {
					components: { productName: <>{ productTitle }</> },
				} ) }

				<img className="license-lightbox-link__icon" src={ ModalLinkIcon } alt="" />
			</Button>

			{ showLightbox && <LicenseLightbox onClose={ onHideLightbox } /> }
		</>
	);
};

export default LicenseLightboxLink;
