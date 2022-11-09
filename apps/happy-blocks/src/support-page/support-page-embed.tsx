import { SupportPageBlockAttributes } from './block';
import { WordPressIcon } from './icon';

export const SupportPageEmbed = ( props: { attributes: SupportPageBlockAttributes } ) => {
	return (
		<div className="hb-support-page-embed">
			<div className="hb-support-page-embed__header">
				<WordPressIcon variant="large" />
				<div>
					<div className="hb-support-page-embed__title">
						Domains » Change a Domain Name
						<div className="hb-support-page-embed__badge">Support article</div>
					</div>
					<div>
						in
						<a href={ props.attributes.url }>WordPress.com Support</a>
					</div>
					<div className="hb-support-page-embed__time-to-read">2 min read</div>
				</div>
			</div>
			<div className="hb-support-page-embed__content">{ props.attributes.content }</div>
			<div className="hb-support-page-embed__reactions">923 people have found this useful!</div>
		</div>
	);
};
