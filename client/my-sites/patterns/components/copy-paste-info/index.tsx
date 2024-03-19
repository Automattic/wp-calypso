import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import ImgCopyPaste from './images/copy-paste.svg';
import ImgEdit from './images/edit.svg';
import ImgResponsive from './images/responsive.svg';
import ImgStyle from './images/style.svg';

import './style.scss';

export function PatternsCopyPasteInfo() {
	return (
		<PatternsSection
			title="Copy. Paste. Customize."
			description="Build fast while maintaining your sites character."
			theme="dark"
			bodyFullWidth
		>
			<div className="section-patterns-info">
				<div className="section-patterns-info__inner">
					<div className="section-patterns-info__item">
						<div className="section-patterns-info__item-image">
							<img src={ ImgCopyPaste } alt="..." />
						</div>
						<div className="section-patterns-info__item-title">Copy and paste</div>
						<div className="section-patterns-info__item-description">
							Drop patterns directly into the WordPress editor to build out your pages.
						</div>
					</div>
					<div className="section-patterns-info__item">
						<div className="section-patterns-info__item-image">
							<img src={ ImgStyle } alt="..." />
						</div>
						<div className="section-patterns-info__item-title">Bring your style</div>
						<div className="section-patterns-info__item-description">
							Patterns inherit typography and color styles from your site to ensure every page looks
							great.
						</div>
					</div>
					<div className="section-patterns-info__item">
						<div className="section-patterns-info__item-image">
							<img src={ ImgEdit } alt="..." />
						</div>
						<div className="section-patterns-info__item-title">Edit everything</div>
						<div className="section-patterns-info__item-description">
							Patterns are collections of regular WordPress blocks. Edit them however you want.
						</div>
					</div>
					<div className="section-patterns-info__item">
						<div className="section-patterns-info__item-image">
							<img src={ ImgResponsive } alt="..." />
						</div>
						<div className="section-patterns-info__item-title">Fully responsive</div>
						<div className="section-patterns-info__item-description">
							All patterns are fully responsive to ensure they look fantastic on any device.
						</div>
					</div>
				</div>
			</div>
		</PatternsSection>
	);
}
