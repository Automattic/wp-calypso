import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { Button } from '@wordpress/components';
import { Icon, arrowLeft } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { PatternsGetStarted } from 'calypso/my-sites/patterns/components/get-started';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';
import { ReadymadeTemplateDetailsFC } from 'calypso/my-sites/patterns/types';

import './style.scss';

export const ReadymadeTemplateDetails: ReadymadeTemplateDetailsFC = ( { id } ) => {
	useEffect( () => {
		window.scroll( 0, 0 );
	}, [] );

	const translate = useTranslate();

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
						<Icon icon={ arrowLeft } size={ 24 } /> { translate( 'Back to patterns' ) }
					</a>
					<div className="readymade-template-details">
						<div className="readymade-template-details-content">
							<div className="readymade-template-details-header">
								<h1 className="readymade-template-details-title">{ readymadeTemplate.title }</h1>
								<div className="readymade-template-details-actions">
									<Button variant="secondary">{ translate( 'Copy layout' ) }</Button>
									<Button variant="primary">{ translate( 'Pick this layout' ) }</Button>
								</div>
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
