import { __ } from '@wordpress/i18n';
import ResourceProductLogo from './resource-product-logo';
import ResourceThumbnail from './resource-thumbnail';
import type { LibraryResource } from './types';

export default function ResourceCover( {
	resource,
	featured = false,
	showDescription = false,
}: {
	resource: LibraryResource;
	featured?: boolean;
	showDescription?: boolean;
} ) {
	return (
		<div
			className="resource-title-cover"
			data-product={ resource.product }
			data-content-type={ resource.contentType }
		>
			<div className="resource-title-cover-label">
				<span>{ resource.contentType }</span>
				{ featured && (
					<span className="resource-title-cover-featured">{ __( 'Top resource' ) }</span>
				) }
				<ResourceThumbnail contentType={ resource.contentType } />
			</div>
			<span className="resource-title-cover-heading" dir="auto">
				{ resource.title }
			</span>
			{ showDescription && (
				<p className="resource-recommendation-description" dir="auto">
					{ resource.description }
				</p>
			) }
			<div className="resource-title-cover-brand">
				<ResourceProductLogo product={ resource.product } />
			</div>
		</div>
	);
}
