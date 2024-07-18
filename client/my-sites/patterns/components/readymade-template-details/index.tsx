import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { Icon, arrowLeft, check, copy } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { createElement, useEffect, useState } from 'react';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';
import { ReadymadeTemplateDetailsFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

const PatternLibraryLink = ( { children }: { children: React.ReactNode } ) => (
	<a href={ addLocaleToPathLocaleInFront( '/patterns' ) }>{ children }</a>
);

export const ReadymadeTemplateDetails: ReadymadeTemplateDetailsFC = ( { id } ) => {
	const translate = useTranslate();
	const [ isCopied, setIsCopied ] = useState( false );

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

	const copyLayout = () => {
		navigator.clipboard.writeText(
			readymadeTemplate.home.header + readymadeTemplate.home.content + readymadeTemplate.home.footer
		);
		setIsCopied( true );
	};

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
							<div className="readymade-template-details-header">
								<h1 className="readymade-template-details-title">{ readymadeTemplate.title }</h1>
								<div className="readymade-template-details-actions">
									<Button
										variant="secondary"
										icon={ isCopied ? check : copy }
										onClick={ copyLayout }
									>
										{ isCopied ? translate( 'Copied' ) : translate( 'Copy layout' ) }
									</Button>
									<Button
										variant="primary"
										href={ `/setup/readymade-template?readymadeTemplateId=${ readymadeTemplate.template_id }` }
									>
										{ translate( 'Pick this layout' ) }
									</Button>
								</div>
							</div>
							<div className="readymade-template-details-preview-mobile">
								<img
									src="https://s0.wp.com/wp-content/rest-api-plugins/endpoints/themes/ready-made-templates-data/neonfit.webp"
									alt=""
								/>
							</div>
							<div
								className="readymade-template-details-description"
								// eslint-disable-next-line react/no-danger
								dangerouslySetInnerHTML={ { __html: readymadeTemplate.description } }
							/>

							<div className="readymade-template-details-info">
								<div className="readymade-template-details-subheading">
									{ translate( 'Customize it to your heart’s content' ) }
								</div>

								<p>
									{ translate(
										'Begin with this layout and transform it using our powerful site editing tools.'
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
								<p>
									<a href="/support/site-editor">
										{ translate( 'Learn more about how the site editor works.' ) }
									</a>
								</p>
							</div>
						</div>
						<div className="readymade-template-details-preview">
							<img
								src="https://s0.wp.com/wp-content/rest-api-plugins/endpoints/themes/ready-made-templates-data/neonfit.webp"
								alt=""
							/>
						</div>
					</div>
				</div>
			</section>
			<PatternsGetStarted />
		</>
	);
};
