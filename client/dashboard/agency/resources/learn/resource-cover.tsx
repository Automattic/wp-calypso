import { __ } from '@wordpress/i18n';
import ResourceProductLogo from './resource-product-logo';
import ResourceRecommendationTitle from './resource-recommendation-title';
import ResourceThumbnail from './resource-thumbnail';
import type { LibraryResource } from './types';

export default function ResourceCover( {
	resource,
	featured = false,
	showDescription = false,
	showType = true,
}: {
	resource: LibraryResource;
	featured?: boolean;
	showDescription?: boolean;
	showType?: boolean;
} ) {
	return (
		<div
			className="resource-title-cover"
			data-product={ resource.product }
			data-content-type={ resource.contentType }
		>
			{ ! showDescription && (
				<div className="resource-title-cover-label">
					{ showType && <span>{ resource.contentType }</span> }
					{ featured && (
						<span className="resource-title-cover-featured">{ __( 'Top resource' ) }</span>
					) }
					<ResourceThumbnail contentType={ resource.contentType } />
				</div>
			) }
			{ showDescription && (
				<div className="resource-recommendation-illustration">
					<ResourceThumbnail contentType={ resource.contentType } />
				</div>
			) }
			{ showDescription ? (
				<div className="resource-recommendation-copy">
					<ResourceRecommendationTitle title={ resource.title } />
					<p className="resource-recommendation-description" dir="auto">
						{ resource.description }
					</p>
				</div>
			) : (
				<span className="resource-title-cover-heading" dir="auto">
					{ resource.title }
				</span>
			) }
			<div className="resource-title-cover-brand">
				<ResourceProductLogo product={ resource.product } />
			</div>
		</div>
	);
}
