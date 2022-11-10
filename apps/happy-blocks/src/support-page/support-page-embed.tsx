import { __, sprintf } from '@wordpress/i18n';
import { SupportPageBlockAttributes } from './block';
import { WordPressIcon } from './icon';
import { InlineSkeleton } from './inline-skeleton';

export const SupportPageEmbed = ( props: { attributes: SupportPageBlockAttributes } ) => {
	const loaded = !! props.attributes.content;

	const minToRead = sprintf(
		/* translators: Minutes it takes to read embedded support page, eg: "5 min to read" */
		__( '%1$d min read', 'happy-blocks' ),
		props.attributes.minutesToRead ?? 0
	);

	const likes = sprintf(
		/* translators: Number of people marked this page useful, eg: "25332 people have found this useful" */
		__( '%1$d people have found this useful!', 'happy-blocks' ),
		props.attributes.minutesToRead ?? 0
	);

	return (
		<div className="hb-support-page-embed">
			<div className="hb-support-page-embed__header">
				<WordPressIcon variant="raster" />
				<div>
					<div className="hb-support-page-embed__title">
						<InlineSkeleton loaded={ loaded }>
							{ props.attributes.title }
							{ /*<span className="hb-support-page-embed__badge">Support article</span>*/ }
						</InlineSkeleton>
					</div>
					<div className="hb-support-page-embed__source">
						<InlineSkeleton hidden loaded={ loaded }>
							<span>in</span>
							<a href={ props.attributes.url }>WordPress.com Support</a>
						</InlineSkeleton>
					</div>
					{ ( ! loaded || props.attributes.minutesToRead ) && (
						<div className="hb-support-page-embed__time-to-read">
							<InlineSkeleton loaded={ loaded }>{ minToRead }</InlineSkeleton>
						</div>
					) }
				</div>
			</div>
			<div className="hb-support-page-embed__content">
				<InlineSkeleton large loaded={ loaded }>
					{ props.attributes.content }
				</InlineSkeleton>
			</div>
			{ ( ! loaded || props.attributes.likes ) && (
				<div className="hb-support-page-embed__reactions">
					<InlineSkeleton loaded={ loaded }>{ likes }</InlineSkeleton>
				</div>
			) }
		</div>
	);
};
