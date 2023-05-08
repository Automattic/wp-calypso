import { JetpackTag } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { TagIcons } from './icons';

type Props = { tags: JetpackTag[] };

export const LicenseProductLightboxRecommendationTags: FunctionComponent< Props > = ( {
	tags: tags,
} ) => {
	const translate = useTranslate();

	return (
		<div className="license-product-lightbox__detail-tags">
			<span className="product-lightbox__detail-tags-label">{ translate( 'Great for:' ) }</span>

			<ul className="license-product-lightbox__detail-tags-list">
				{ tags.map( ( tag ) => (
					<li className="license-product-lightbox__detail-tags-tag" key={ tag.tag }>
						<span aria-hidden="true">{ TagIcons[ tag.tag ] }</span>
						<p>{ tag.label }</p>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default LicenseProductLightboxRecommendationTags;
