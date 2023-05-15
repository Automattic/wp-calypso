import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import ModalLinkIcon from 'calypso/assets/images/jetpack/jetpack-icon-modal-link.svg';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import LicenseLightbox, { LicenseLightBoxProps } from '../license-lightbox';
import { getProductTitle } from '../utils';

import './style.scss';

type Props = Pick<
	LicenseLightBoxProps,
	'ctaLabel' | 'isCTAPrimary' | 'isDisabled' | 'onActivate' | 'product'
>;

const LicenseLightboxWrapper: FunctionComponent< Props > = ( {
	product,
	ctaLabel,
	isCTAPrimary,
	isDisabled,
	onActivate,
} ) => {
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
		<div className="license-lightbox-wrapper">
			<Button className="license-lightbox-wrapper__link" onClick={ onShowLightbox } plain>
				{ translate( 'More about {{productName/}}', {
					components: { productName: <>{ productTitle }</> },
				} ) }

				<img className="license-lightbox-wrapper__link-icon" src={ ModalLinkIcon } alt="" />
			</Button>

			{ showLightbox && (
				<LicenseLightbox
					ctaLabel={ ctaLabel }
					isCTAPrimary={ isCTAPrimary }
					isDisabled={ isDisabled }
					onActivate={ onActivate }
					onClose={ onHideLightbox }
					product={ product }
				/>
			) }
		</div>
	);
};

export default LicenseLightboxWrapper;
