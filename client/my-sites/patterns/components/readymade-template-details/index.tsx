import { PremiumBadge } from '@automattic/components';
import { addLocaleToPathLocaleInFront, useLocalizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { createElement, useEffect } from 'react';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { ReadymadeTemplatePreview } from 'calypso/my-sites/patterns/components/readymade-template-preview';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';
import { ReadymadeTemplateDetailsFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

const PatternLibraryLink = ( { children }: { children: React.ReactNode } ) => (
	<a href={ addLocaleToPathLocaleInFront( '/patterns' ) }>{ children }</a>
);

export const ReadymadeTemplateDetails: ReadymadeTemplateDetailsFC = ( { slug } ) => {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();

	useEffect( () => {
		window.scroll( 0, 0 );
	}, [] );

	const { data: readymadeTemplates = [] } = useReadymadeTemplates();
	if ( ! readymadeTemplates.length ) {
		return null;
	}

	const readymadeTemplate = readymadeTemplates.find( ( rt ) => rt.slug === slug );
	if ( ! readymadeTemplate ) {
		return null;
	}

	return (
		<>
			<section className="readymade-template-details-wrapper">
				<div className="readymade-template-details-section">
					<a
						href={ addLocaleToPathLocaleInFront( '/patterns' ) + '#readymade-templates-section' }
						className="readymade-template-details-back"
					>
						<Icon icon={ arrowLeft } size={ 24 } /> { translate( 'Back' ) }
					</a>
					<div className="readymade-template-details">
						<div className="readymade-template-details-content">
							<PremiumBadge shouldHideTooltip className="readymade-template-details-premium" />
							<div className="readymade-template-details-header">
								<h1 className="readymade-template-details-title">{ readymadeTemplate.title }</h1>
								<div className="readymade-template-details-actions">
									<Button
										variant="primary"
										href={ `/setup/readymade-template?readymadeTemplateId=${ readymadeTemplate.template_id }` }
									>
										{ translate( 'Pick this layout' ) }
									</Button>
								</div>
							</div>
							<div className="readymade-template-details-preview-mobile">
								<ReadymadeTemplatePreview readymadeTemplate={ readymadeTemplate } />
							</div>
							<div className="readymade-template-details-description">
								<div // eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={ { __html: readymadeTemplate.description } }
								/>
								<h4>{ translate( 'Customize it with AI' ) }</h4>
								<p>
									{ translate(
										'Start with this layout and use our AI assistant to create the website of your dreams without breaking a sweat.'
									) }
								</p>
								<p>
									{ translate(
										'Just describe your site in a few sentences, and our AI tool will customize the content for you.'
									) }
								</p>
								<h4>{ translate( 'Need full control?' ) }</h4>
								<p>
									{ translate(
										'If you want even more control, our powerful site editing tools are always at your disposal, allowing you to customize every single detail of this beautiful layout.'
									) }
								</p>
								<p>
									{ createInterpolateElement(
										translate(
											'Modify the layout, colors, typography, and content to fit your unique style and needs. Plus, use any pattern from our <Link>pattern library</Link> to enhance and tailor your site ensuring it truly stands out.'
										),
										{
											Link: createElement( PatternLibraryLink ),
										}
									) }
								</p>
								<a href={ localizeUrl( 'https://wordpress.com/support/site-editor/' ) }>
									{ translate( 'Learn more about how the site editor works.' ) }
								</a>
							</div>
						</div>
						<div className="readymade-template-details-preview">
							<ReadymadeTemplatePreview readymadeTemplate={ readymadeTemplate } />
						</div>
					</div>
				</div>
			</section>
			<PatternsGetStarted />
		</>
	);
};
