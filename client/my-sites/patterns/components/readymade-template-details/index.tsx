import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { Icon, arrowLeft, check, copy } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';
import { ReadymadeTemplateDetailsFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

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
		navigator.clipboard.writeText( readymadeTemplate.content );
		setIsCopied( true );
	};

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
								<img src={ readymadeTemplate.screenshot } alt="" />
							</div>
							<div
								className="readymade-template-details-description"
								// eslint-disable-next-line react/no-danger
								dangerouslySetInnerHTML={ { __html: readymadeTemplate.description } }
							/>
						</div>
						<div className="readymade-template-details-preview">
							<img src={ readymadeTemplate.screenshot } alt="" />
						</div>
					</div>
				</div>
			</section>
			<PatternsGetStarted />
		</>
	);
};
