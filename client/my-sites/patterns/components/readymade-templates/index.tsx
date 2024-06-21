import { BlockRendererContainer, BlockRendererProvider } from '@automattic/block-renderer';
import { useTranslate } from 'i18n-calypso';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { RENDERER_SITE_ID } from 'calypso/my-sites/patterns/constants';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';

import './style.scss';

export function ReadymadeTemplates() {
	const translate = useTranslate();
	const { data: readymadeTemplates = [] } = useReadymadeTemplates();

	if ( ! readymadeTemplates || ! readymadeTemplates.length ) {
		return;
	}

	return (
		<BlockRendererProvider siteId={ RENDERER_SITE_ID }>
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
								<BlockRendererContainer viewportWidth={ 1200 }>
									<div
										// eslint-disable-next-line react/no-danger
										dangerouslySetInnerHTML={ { __html: readymadeTemplate.content } }
									/>
								</BlockRendererContainer>
							</div>
							<div className="readymade-template__title">{ readymadeTemplate.title }</div>
						</div>
					) ) }
				</div>
			</PatternsSection>
		</BlockRendererProvider>
	);
}
