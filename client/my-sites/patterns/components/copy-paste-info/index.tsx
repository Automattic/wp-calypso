import { useTranslate } from 'i18n-calypso';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import ImgCopyPaste from './images/copy-paste.svg';
import ImgEdit from './images/edit.svg';
import ImgResponsive from './images/responsive.svg';
import ImgStyle from './images/style.svg';

import './style.scss';

export function PatternsCopyPasteInfo() {
	const translate = useTranslate();
	return (
		<PatternsSection
			bodyFullWidth
			description={ translate(
				'Pick out a pattern, copy-paste it into your design, and customize it any way you like. No plugins needed.'
			) }
			theme="dark"
			title={ translate( 'Copy, paste, customize—it’s easy like that' ) }
		>
			<div className="section-patterns-info">
				<div className="section-patterns-info__inner">
					<div className="section-patterns-info__item">
						<div className="section-patterns-info__item-image">
							<img src={ ImgCopyPaste } alt="" />
						</div>

						<div className="section-patterns-info__item-title">
							{ translate( 'Copy-paste your way' ) }
						</div>
						<div className="section-patterns-info__item-description">
							{ translate(
								'Paste patterns directly into the WordPress editor to fully customize them.'
							) }
						</div>
					</div>

					<div className="section-patterns-info__item">
						<div className="section-patterns-info__item-image">
							<img src={ ImgStyle } alt="" />
						</div>

						<div className="section-patterns-info__item-title">
							{ translate( 'Bring your style with you' ) }
						</div>
						<div className="section-patterns-info__item-description">
							{ translate(
								'Patterns replicate the typography and color palette from your site to ensure every page is on-brand.'
							) }
						</div>
					</div>

					<div className="section-patterns-info__item">
						<div className="section-patterns-info__item-image">
							<img src={ ImgEdit } alt="" />
						</div>

						<div className="section-patterns-info__item-title">
							{ translate( 'Make it yours' ) }
						</div>
						<div className="section-patterns-info__item-description">
							{ translate(
								'Patterns are collections of regular WordPress blocks, so you can edit every detail, however you want.'
							) }
						</div>
					</div>

					<div className="section-patterns-info__item">
						<div className="section-patterns-info__item-image">
							<img src={ ImgResponsive } alt="" />
						</div>

						<div className="section-patterns-info__item-title">
							{ translate( 'Responsive by design' ) }
						</div>
						<div className="section-patterns-info__item-description">
							{ translate(
								'All patterns are fully responsive to ensure they look fantastic on any device or screen.'
							) }
						</div>
					</div>
				</div>
			</div>
		</PatternsSection>
	);
}
