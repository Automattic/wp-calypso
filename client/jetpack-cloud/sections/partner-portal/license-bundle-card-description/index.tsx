import { useTranslate } from 'i18n-calypso';
import GreenCheckmark from 'calypso/assets/images/jetpack/jetpack-green-checkmark.svg';
import { useProductDescription } from '../hooks';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

interface Props {
	product: APIProductFamilyProduct;
}

export default function LicenseBundleCardDescription( { product }: Props ) {
	const translate = useTranslate();

	const { description, features } = useProductDescription( product.slug );

	return (
		<div className="license-bundle-card-description">
			<p className="license-bundle-card-description__text">{ description }</p>
			<ul className="license-bundle-card-description__list">
				{ features.map( ( feature ) => (
					<li key={ `${ feature }` }>
						<img src={ GreenCheckmark } alt={ translate( 'included' ) } />
						{ feature }
					</li>
				) ) }
			</ul>
		</div>
	);
}
