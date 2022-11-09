import { __, sprintf } from '@wordpress/i18n';
import { SupportPageBlockAttributes } from './block';
import { WordPressIcon } from './icon';

export const SupportPageEmbed = ( props: { attributes: SupportPageBlockAttributes } ) => {
	const minToRead = sprintf(
		/* translators: Minutes it takes to read embedded support page, eg: "5 min to read" */
		__( '%1$d min read', 'happy-blocks' ),
		props.attributes.minutesToRead
	);

	return (
		<div className="hb-support-page-embed">
			<div className="hb-support-page-embed__header">
				<WordPressIcon variant="raster" />
				<div>
					<div className="hb-support-page-embed__title">
						{ props.attributes.title }
						{ /*<span className="hb-support-page-embed__badge">Support article</span>*/ }
					</div>
					<div className="hb-support-page-embed__source">
						<span>in</span>
						<a href={ props.attributes.url }>WordPress.com Support</a>
					</div>
					{ props.attributes.minutesToRead && (
						<div className="hb-support-page-embed__time-to-read">{ minToRead }</div>
					) }
				</div>
			</div>
			<div className="hb-support-page-embed__content">{ props.attributes.content }</div>
			{ props.attributes.likes && (
				<div className="hb-support-page-embed__reactions">
					${ props.attributes.likes } people have found this useful!
				</div>
			) }
		</div>
	);
};
