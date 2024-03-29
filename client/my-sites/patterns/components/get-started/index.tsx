import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import imagePreviewPublish from 'calypso/my-sites/patterns/components/get-started/images/preview-publish.png';
import imagePageLayouts from 'calypso/my-sites/patterns/components/get-started/images/understand-page-layouts.png';
import imageBlockPatterns from 'calypso/my-sites/patterns/components/get-started/images/use-block-patterns.png';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';

import './style.scss';

export function PatternsGetStarted() {
	return (
		<PatternsSection
			bodyFullWidth
			description="Take a look at our how-to guides to get started with patterns."
			theme="dark"
			title="All about patterns"
		>
			<div className="patterns-get-started__buttons">
				<Button className="patterns-get-started__start-button" href="/start">
					Build a site
				</Button>
			</div>

			<div className="patterns-get-started__list">
				<div className="patterns-get-started__list-inner">
					<a
						className="patterns-get-started__item"
						href={ localizeUrl( 'https://wordpress.com/support/wordpress-editor/block-pattern/' ) }
					>
						<img
							className="patterns-get-started__item-image"
							src={ imageBlockPatterns }
							alt=""
							width="1200"
							height="675"
							loading="lazy"
						/>
						<div className="patterns-get-started__item-name">Video tutorial</div>
						<div className="patterns-get-started__item-description">Block Patterns</div>
					</a>

					<a
						className="patterns-get-started__item"
						href={ localizeUrl( 'https://wordpress.com/support/wordpress-editor/page-layouts/' ) }
					>
						<img
							className="patterns-get-started__item-image"
							src={ imagePageLayouts }
							alt=""
							width="1200"
							height="675"
							loading="lazy"
						/>
						<div className="patterns-get-started__item-name">Video tutorial</div>
						<div className="patterns-get-started__item-description">Use Pre-Made Page Layouts</div>
					</a>

					<a
						className="patterns-get-started__item"
						href={ localizeUrl( 'https://wordpress.com/learn/webinars/compelling-homepages/' ) }
					>
						<img
							className="patterns-get-started__item-image"
							src={ imagePreviewPublish }
							alt=""
							width="1137"
							height="639"
							loading="lazy"
						/>
						<div className="patterns-get-started__item-name">Free course</div>
						<div className="patterns-get-started__item-description">Design Your Homepage</div>
					</a>
				</div>
			</div>
		</PatternsSection>
	);
}
