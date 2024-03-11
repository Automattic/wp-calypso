import { useLocale } from '@automattic/i18n-utils';
import DocumentHead from 'calypso/components/data/document-head';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { PatternsGridGallery } from 'calypso/my-sites/patterns/components/grid-gallery';
import { PatternsHeader } from 'calypso/my-sites/patterns/components/header';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { usePatternCategories } from 'calypso/my-sites/patterns/hooks/use-pattern-categories';
import ImgCopyPaste from './images/copy-paste.svg';
import ImgEdit from './images/edit.svg';
import ImgLayout from './images/layout.svg';
import ImgPattern from './images/pattern.svg';
import ImgResponsive from './images/responsive.svg';
import ImgStyle from './images/style.svg';

import './style.scss';

export const PatternsHomePage = () => {
	const locale = useLocale();

	const { data: categories } = usePatternCategories( locale );

	return (
		<>
			<DocumentHead title="WordPress Patterns- Home" />

			<PatternsHeader
				title="Build your perfect site with patterns"
				description="Hundreds of expertly designed, fully responsive patterns allow you to craft a beautiful site in minutes."
			/>

			<PatternsGridGallery
				title="Ship faster with patterns"
				description="Choose from a huge library of patterns to build any page you need."
				list={ categories?.map( ( category ) => ( {
					name: category.name,
					label: category.label,
					number: category.regularPatternCount,
					image: ImgPattern,
					link: `/patterns/${ category.name }`,
				} ) ) }
			/>

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
								Patterns inherit typography and color styles from your site to ensure every page
								looks great.
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

			<PatternsGridGallery
				title="Beautifully curated page layouts"
				description="Entire pages built of patterns, ready to be added to your site."
				columnCount={ 3 }
				list={ categories
					?.filter( ( { pagePatternCount } ) => pagePatternCount )
					.map( ( category ) => ( {
						name: category.name,
						label: category.label,
						number: category.pagePatternCount,
						image: ImgLayout,
						link: `/patterns/${ category.name }`,
					} ) ) }
			/>

			<PatternsGetStarted />
		</>
	);
};
