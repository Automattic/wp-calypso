import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import imagePreviewPublish from 'calypso/my-sites/patterns/components/get-started/images/preview-publish.png';
import imagePageLayouts from 'calypso/my-sites/patterns/components/get-started/images/understand-page-layouts.png';
import imageBlockPatterns from 'calypso/my-sites/patterns/components/get-started/images/use-block-patterns.png';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';

import './style.scss';

export function PatternsGetStarted() {
	const translate_not_yet = useTranslate();
	return (
		<PatternsSection
			bodyFullWidth
			description={ translate_not_yet(
				'Take a look at our how-to guides to get started with patterns.'
			) }
			theme="dark"
			title={ translate_not_yet( 'All about patterns' ) }
		>
			<div className="patterns-get-started__buttons">
				<Button className="patterns-get-started__start-button" href="/start">
					{ translate_not_yet( 'Build a site' ) }
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
						<div className="patterns-get-started__item-name">
							{ translate_not_yet( 'Video tutorial' ) }
						</div>
						<div className="patterns-get-started__item-description">
							{ translate_not_yet( 'Block Patterns' ) }
						</div>
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
						<div className="patterns-get-started__item-name">
							{ translate_not_yet( 'Video tutorial' ) }
						</div>
						<div className="patterns-get-started__item-description">
							{ translate_not_yet( 'Use Pre-Made Page Layouts' ) }
						</div>
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
						<div className="patterns-get-started__item-name">
							{ translate_not_yet( 'Free course' ) }
						</div>
						<div className="patterns-get-started__item-description">
							{ translate_not_yet( 'Design Your Homepage' ) }
						</div>
					</a>
				</div>
			</div>
		</PatternsSection>
	);
}
