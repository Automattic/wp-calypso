import { __ } from '@wordpress/i18n';
import SectionHeading from '../shared/section-heading';
import { ThreadsLinkPreview } from './link-preview';
import { ThreadsPostPreview } from './post-preview';
import type { ThreadsPreviewsProps } from './types';

export const ThreadsPreviews: React.FC< ThreadsPreviewsProps > = ( {
	headingLevel,
	hideLinkPreview,
	hidePostPreview,
	posts,
} ) => {
	if ( ! posts?.length ) {
		return null;
	}

	return (
		<div className="social-preview threads-preview">
			{ ! hidePostPreview && (
				<section className="social-preview__section threads-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a social post on Threads
							__( 'Your post', 'social-previews' )
						}
					</SectionHeading>
					<p className="social-preview__section-desc">
						{ __( 'This is what your social post will look like on Threads:', 'social-previews' ) }
					</p>
					{ posts.map( ( post, index ) => {
						const isLast = index + 1 === posts.length;
						return (
							<ThreadsPostPreview
								key={ `threads-preview__post-${ index }` }
								{ ...post }
								showThreadConnector={ ! isLast }
							/>
						);
					} ) }
				</section>
			) }
			{ ! hideLinkPreview ? (
				<section className="social-preview__section threads-preview__section">
					<SectionHeading level={ headingLevel }>
						{
							// translators: refers to a link to a Threads post
							__( 'Link preview', 'social-previews' )
						}
					</SectionHeading>
					{ posts[ 0 ].image ? (
						<>
							<p className="social-preview__section-desc">
								{ __(
									'This is what it will look like when someone shares the link to your WordPress post on Threads.',
									'social-previews'
								) }
							</p>
							<ThreadsLinkPreview { ...posts[ 0 ] } name="" profileImage="" />
						</>
					) : (
						<p className="social-preview__section-desc">
							{ __(
								'Threads link preview requires an image to be set for the post. Please add an image to see the preview.',
								'social-previews'
							) }
						</p>
					) }
				</section>
			) : null }
		</div>
	);
};
