import { SupportPageBlockAttributes } from './block';
import { WordPressIcon } from './icon';

export const SupportPageEmbed = ( props: { attributes: SupportPageBlockAttributes } ) => {
	return (
		<div className="hb-support-page-embed">
			<div className="hb-support-page-embed__header">
				<WordPressIcon variant="raster" />
				<div>
					<div className="hb-support-page-embed__title">
						{ props.attributes.title }
						<span className="hb-support-page-embed__badge">Support article</span>
					</div>
					<div className="hb-support-page-embed__source">
						<span>in</span>
						<a href={ props.attributes.url }>WordPress.com Support</a>
					</div>
					{ props.attributes.minutesToRead && (
						<div className="hb-support-page-embed__time-to-read">2 min read</div>
					) }
				</div>
			</div>
			<div className="hb-support-page-embed__content">{ props.attributes.content }</div>
			<div className="hb-support-page-embed__reactions">923 people have found this useful!</div>
		</div>
	);
};
