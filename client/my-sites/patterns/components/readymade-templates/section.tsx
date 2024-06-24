import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { ReadymadeTemplate, ReadymadeTemplatesProps } from 'calypso/my-sites/patterns/types';
import './style.scss';

type ReadymadeTemplatesSectionProps = ReadymadeTemplatesProps & {
	renderPreview?: ( readymadeTemplate: ReadymadeTemplate ) => ReactNode;
};

export const ReadymadeTemplatesSection = ( {
	readymadeTemplates,
	renderPreview,
}: ReadymadeTemplatesSectionProps ) => {
	const translate = useTranslate();

	if ( ! readymadeTemplates.length ) {
		return;
	}

	return (
		<PatternsSection
			bodyFullWidth
			description={ translate(
				'Explore a collection of beautiful site layouts made with our patterns.'
			) }
			theme="dark"
			title={ translate( 'Ready-to-use site layouts' ) }
		>
			<div className="readymade-templates">
				{ readymadeTemplates.map( ( readymadeTemplate ) => (
					<div className="readymade-template" key={ readymadeTemplate.template_id }>
						<div className="readymade-template__content">
							{ renderPreview?.( readymadeTemplate ) }
						</div>
						<div className="readymade-template__title">{ readymadeTemplate.title }</div>
					</div>
				) ) }
			</div>
		</PatternsSection>
	);
};
