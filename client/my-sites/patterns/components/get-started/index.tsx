import { Button } from '@wordpress/components';
import ImgBlockPatterns from 'calypso/my-sites/patterns/components/get-started/images/block-patterns.svg';
import ImgHomePage from 'calypso/my-sites/patterns/components/get-started/images/home-page.svg';
import ImgPageLayouts from 'calypso/my-sites/patterns/components/get-started/images/page-layouts.svg';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';

import './style.scss';

export const PatternsGetStarted = () => {
	return (
		<PatternsSection
			title="Get started with patterns"
			description="Our favorite how-to guides to get you started with patterns."
			theme="dark"
			bodyFullWidth
		>
			<div className="patterns-get-started__buttons">
				<Button className="patterns-get-started__buttons-build" href="#">
					Build a site
				</Button>
			</div>

			<div className="patterns-get-started__list">
				<div className="patterns-get-started__list-inner">
					<a className="patterns-get-started__item" href="aaa">
						<img
							src={ ImgBlockPatterns }
							alt="VIDEO TUTORIAL"
							className="patterns-get-started__item-image"
						/>
						<div className="patterns-get-started__item-name">VIDEO TUTORIAL</div>
						<div className="patterns-get-started__item-description">Block Patterns</div>
					</a>
					<a className="patterns-get-started__item" href="aaa">
						<img
							src={ ImgPageLayouts }
							alt="VIDEO TUTORIAL"
							className="patterns-get-started__item-image"
						/>
						<div className="patterns-get-started__item-name">VIDEO TUTORIAL</div>
						<div className="patterns-get-started__item-description">Use Pre-Made Page Layouts</div>
					</a>
					<a className="patterns-get-started__item" href="aaa">
						<img
							src={ ImgHomePage }
							alt="FREE COURSE"
							className="patterns-get-started__item-image"
						/>
						<div className="patterns-get-started__item-name">FREE COURSE</div>
						<div className="patterns-get-started__item-description">Design Your Homepage</div>
					</a>
				</div>
			</div>
		</PatternsSection>
	);
};
