import { useTranslate } from 'i18n-calypso';
import { preventWidows } from 'calypso/lib/formatting';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import ImgCopyPaste from './images/copy-paste.svg';
import ImgEdit from './images/edit.svg';
import ImgResponsive from './images/responsive.svg';
import ImgStyle from './images/style.svg';

import './style.scss';

export function PatternsCopyPasteInfo( { theme }: { theme?: 'dark' | 'gray' } ) {
	const translate = useTranslate();
	return (
		<PatternsSection
			bodyFullWidth
			description={ translate(
				'Pick out a pattern, copy-paste it into your design, and customize it any way you like. No plugins needed.',
				{
					comment: 'Refers to block patterns in the WordPress.com pattern library',
					textOnly: true,
				}
			) }
			theme={ theme }
			title={ translate( 'Copy, paste, customize—it’s easy like that', {
				comment:
					'Heading text in a section that contains info about block patterns built by WordPress.com',
				textOnly: true,
			} ) }
		>
			<div className="section-patterns-info">
				<div className="section-patterns-info__item">
					<div className="section-patterns-info__item-image">
						<img src={ ImgCopyPaste } alt="" />
					</div>

					<div className="section-patterns-info__item-title">
						{ translate( 'Copy-paste your way', {
							comment: 'Refers to block patterns, and the fact that they can easily be copy-pasted',
						} ) }
					</div>
					<div className="section-patterns-info__item-description">
						{ preventWidows(
							translate(
								'Paste patterns directly into the WordPress editor to fully customize them.'
							)
						) }
					</div>
				</div>

				<div className="section-patterns-info__item">
					<div className="section-patterns-info__item-image">
						<img src={ ImgStyle } alt="" />
					</div>

					<div className="section-patterns-info__item-title">
						{ translate( 'Bring your style with you', {
							comment:
								'Refers to block patterns built by WordPress.com, and the way they adapt to theme style settings',
						} ) }
					</div>
					<div className="section-patterns-info__item-description">
						{ preventWidows(
							translate(
								'Patterns replicate the typography and color palette from your site to ensure every page is on-brand.'
							)
						) }
					</div>
				</div>

				<div className="section-patterns-info__item">
					<div className="section-patterns-info__item-image">
						<img src={ ImgEdit } alt="" />
					</div>

					<div className="section-patterns-info__item-title">
						{ translate( 'Make it yours', {
							comment:
								'Refers to block patterns, and their ability to be customized to build a site.',
						} ) }
					</div>
					<div className="section-patterns-info__item-description">
						{ preventWidows(
							translate(
								'Patterns are collections of regular WordPress blocks, so you can edit every detail, however you want.'
							)
						) }
					</div>
				</div>

				<div className="section-patterns-info__item">
					<div className="section-patterns-info__item-image">
						<img src={ ImgResponsive } alt="" />
					</div>

					<div className="section-patterns-info__item-title">
						{ translate( 'Responsive by design', {
							comment:
								'Refers to block patterns built by WordPress.com, and their built-in responsiveness.',
						} ) }
					</div>
					<div className="section-patterns-info__item-description">
						{ preventWidows(
							translate(
								'All patterns are fully responsive to ensure they look fantastic on any device or screen.',
								{
									comment:
										'Refers to block patterns built by WordPress.com, and their built-in responsiveness.',
								}
							)
						) }
					</div>
				</div>
			</div>
		</PatternsSection>
	);
}
