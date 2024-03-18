import { localizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import ImgBlockPatterns from 'calypso/my-sites/patterns/components/get-started/images/block-patterns.svg';
import ImgHomePage from 'calypso/my-sites/patterns/components/get-started/images/home-page.svg';
import ImgPageLayouts from 'calypso/my-sites/patterns/components/get-started/images/page-layouts.svg';
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
						<img src={ ImgBlockPatterns } alt="" className="patterns-get-started__item-image" />
						<div className="patterns-get-started__item-name">Video tutorial</div>
						<div className="patterns-get-started__item-description">Block Patterns</div>
					</a>

					<a
						className="patterns-get-started__item"
						href={ localizeUrl( 'https://wordpress.com/support/wordpress-editor/page-layouts/' ) }
					>
						<img src={ ImgPageLayouts } alt="" className="patterns-get-started__item-image" />
						<div className="patterns-get-started__item-name">Video tutorial</div>
						<div className="patterns-get-started__item-description">Use Pre-Made Page Layouts</div>
					</a>

					<a
						className="patterns-get-started__item"
						href={ localizeUrl( 'https://wordpress.com/learn/webinars/compelling-homepages/' ) }
					>
						<img src={ ImgHomePage } alt="" className="patterns-get-started__item-image" />
						<div className="patterns-get-started__item-name">Free course</div>
						<div className="patterns-get-started__item-description">Design Your Homepage</div>
					</a>
				</div>
			</div>
		</PatternsSection>
	);
}
