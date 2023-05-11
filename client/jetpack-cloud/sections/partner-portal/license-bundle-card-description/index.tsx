import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import GreenCheckmark from 'calypso/assets/images/jetpack/jetpack-green-checkmark.svg';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useProductDescription } from '../hooks';
import LicenseLightbox from '../license-lightbox';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

interface Props {
	product: APIProductFamilyProduct;
}

export default function LicenseBundleCardDescription( { product }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { description, features } = useProductDescription( product.slug );

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

	return (
		<>
			<div className="license-bundle-card-description">
				<p className="license-bundle-card-description__text">
					{ description }
					&nbsp;
					<Button className="license-bundle-card__more-info-link" onClick={ onShowLightbox } plain>
						{ translate( 'Learn more' ) }
					</Button>
				</p>
				<ul className="license-bundle-card-description__list">
					{ features.map( ( feature ) => (
						<li key={ `${ feature }` }>
							<img src={ GreenCheckmark } alt={ translate( 'included' ) } />
							{ feature }
						</li>
					) ) }
				</ul>
			</div>

			{ showLightbox && <LicenseLightbox onClose={ onHideLightbox } /> }
		</>
	);
}
