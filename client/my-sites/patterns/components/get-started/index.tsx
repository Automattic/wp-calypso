import { useLocalizeUrl, useLocale } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import imagePreviewPublish from 'calypso/my-sites/patterns/components/get-started/images/preview-publish.png';
import imagePageLayouts from 'calypso/my-sites/patterns/components/get-started/images/understand-page-layouts.png';
import imageBlockPatterns from 'calypso/my-sites/patterns/components/get-started/images/use-block-patterns.png';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { getOnboardingUrl } from 'calypso/my-sites/patterns/paths';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

import './style.scss';

export function PatternsGetStarted( { theme }: { theme?: 'dark' | 'blue' } ) {
	const translate = useTranslate();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const localizeUrl = useLocalizeUrl();
	const locale = useLocale();

	return (
		<PatternsSection
			description={ translate( 'Take a look at our how-to guides to get started with patterns.' ) }
			theme={ theme }
			title={ translate( 'All about patterns', {
				comment: 'Heading text in a section with informative links about block patterns',
				textOnly: true,
			} ) }
		>
			<div className="patterns-get-started__buttons">
				<Button
					className="patterns-get-started__start-button"
					href={ getOnboardingUrl( locale, isLoggedIn ) }
				>
					{ translate( 'Build a site' ) }
				</Button>
			</div>

			<div className="patterns-get-started__list">
				<a
					className="patterns-get-started__item"
					href={ localizeUrl( 'https://wordpress.com/support/wordpress-editor/block-pattern/' ) }
					rel="noreferrer"
					target="_blank"
				>
					<img
						className="patterns-get-started__item-image"
						src={ imageBlockPatterns }
						alt={ translate( "Support page with the title 'Use block patterns'", {
							comment:
								'This string is the ALT text for an image depicting the Block Patterns support page',
							textOnly: true,
						} ) }
						width="1200"
						height="675"
						loading="lazy"
					/>
					<div className="patterns-get-started__item-name">{ translate( 'Video tutorial' ) }</div>
					<div className="patterns-get-started__item-description">
						{ translate( 'Block Patterns', {
							comment:
								'This string is a copy of the page title from wordpress.com/support/wordpress-editor/block-pattern/',
						} ) }
					</div>
				</a>

				<a
					className="patterns-get-started__item"
					href={ localizeUrl( 'https://wordpress.com/support/wordpress-editor/page-layouts/' ) }
					rel="noreferrer"
					target="_blank"
				>
					<img
						className="patterns-get-started__item-image"
						src={ imagePageLayouts }
						alt={ translate( "Support page with the title 'Understand page layouts'", {
							comment:
								'This string is the ALT text for an image depicting the Page Layouts support page',
							textOnly: true,
						} ) }
						width="1200"
						height="675"
						loading="lazy"
					/>
					<div className="patterns-get-started__item-name">{ translate( 'Video tutorial' ) }</div>
					<div className="patterns-get-started__item-description">
						{ translate( 'Use Pre-Made Page Layouts', {
							comment:
								'This string is a copy of the page title from wordpress.com/support/wordpress-editor/page-layouts/',
						} ) }
					</div>
				</a>

				<a
					className="patterns-get-started__item"
					href="https://wordpress.com/learn/courses/quick-launch/"
					rel="noreferrer"
					target="_blank"
				>
					<img
						className="patterns-get-started__item-image"
						src={ imagePreviewPublish }
						alt={ translate(
							"Row of buttons from the WordPress editor, with a cursor hovering over the 'Publish' button",
							{
								comment:
									'This string is the ALT text for an image depicting the a user clicking on a button labeled "Publish"',
								textOnly: true,
							}
						) }
						width="1137"
						height="639"
						loading="lazy"
					/>
					<div className="patterns-get-started__item-name">{ translate( 'Free course' ) }</div>
					<div className="patterns-get-started__item-description">
						{ translate( 'Launch Your Site Faster', {
							comment:
								'This string is taken from the first line of the page content from https://wordpress.com/learn/courses/quick-launch/',
						} ) }
					</div>
				</a>
			</div>
		</PatternsSection>
	);
}
