import { useTranslate } from 'i18n-calypso';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';

import './style.scss';

export const ReadymadeTemplates = () => {
	const { data: readymadeTemplates = [] } = useReadymadeTemplates();
	const translate = useTranslate();

	if ( ! readymadeTemplates.length ) {
		return;
	}

	return (
		<div id="site-layouts">
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
						<a
							href={ `/patterns/site-layouts/${ readymadeTemplate.template_id } ` }
							className="readymade-template"
							key={ readymadeTemplate.template_id }
						>
							<div className="readymade-template__content">
								<img src={ readymadeTemplate.screenshot } alt="" />
							</div>
							<div className="readymade-template__title">{ readymadeTemplate.title }</div>
						</a>
					) ) }
				</div>
			</PatternsSection>
		</div>
	);
};
