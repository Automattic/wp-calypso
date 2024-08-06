import { addLocaleToPathLocaleInFront, useLocalizeUrl } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { Icon, arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';
import { ReadymadeTemplateDetailsFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const ReadymadeTemplateDetails: ReadymadeTemplateDetailsFC = ( { id, renderPreview } ) => {
	const translate = useTranslate();
	const localizeUrl = useLocalizeUrl();

	useEffect( () => {
		window.scroll( 0, 0 );
	}, [] );

	const { data: readymadeTemplates = [] } = useReadymadeTemplates();
	if ( ! readymadeTemplates.length ) {
		return null;
	}

	const readymadeTemplate = readymadeTemplates.find( ( rt ) => rt.template_id === id );
	if ( ! readymadeTemplate ) {
		return null;
	}

	return (
		<>
			<section className="readymade-template-details-wrapper">
				<div className="readymade-template-details-section">
					<a
						href={ addLocaleToPathLocaleInFront( '/patterns' ) }
						className="readymade-template-details-back"
					>
						<Icon icon={ arrowLeft } size={ 24 } /> { translate( 'Back' ) }
					</a>
					<div className="readymade-template-details">
						<div className="readymade-template-details-content">
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
								{ renderPreview?.( readymadeTemplate ) }
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
										'Just describe your site in a few sentences, and our AI tool will customize the content for your'
									) }
								</p>
								<h4>{ translate( 'Need full control?' ) }</h4>
								<p>
									{ translate(
										'If you want even more control, our powerful site editing tools are always at your disposal, allowing you tu customize every single detail of this beautiful layout.'
									) }
								</p>
								<a href={ localizeUrl( 'https://wordpress.com/support/site-editor/' ) }>
									{ translate( 'Learn more about how the block editor works.' ) }
								</a>
							</div>
						</div>
						<div className="readymade-template-details-preview">
							{ renderPreview?.( readymadeTemplate ) }
						</div>
					</div>
				</div>
			</section>
			<PatternsGetStarted />
		</>
	);
};
