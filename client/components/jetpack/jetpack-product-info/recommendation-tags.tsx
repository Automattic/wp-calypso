import { JetpackTag } from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { Tags } from './icons/tags';

type Props = { tags: JetpackTag[] };

export const JetpackProductInfoRecommendationTags: FunctionComponent< Props > = ( {
	tags: tags,
} ) => {
	const translate = useTranslate();

	return (
		<div className="jetpack-product-info__tags">
			<span className="jetpack-product-info__tags-label">{ translate( 'Great for:' ) }</span>

			<ul className="jetpack-product-info__tags-list">
				{ tags.map( ( { tag, label } ) => (
					<li className="jetpack-product-info__tags-list-item" key={ tag }>
						<span aria-hidden="true">{ Tags[ tag ] }</span>
						<p>{ label }</p>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default JetpackProductInfoRecommendationTags;
