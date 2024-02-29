import { Button } from '@automattic/components';
import SitePreviewPaneContent from '../site-preview-pane/site-preview-pane-content';
import SitePreviewPaneFooter from '../site-preview-pane/site-preview-pane-footer';

type Props = {
	featureText: string | React.ReactNode;
	link: string;
	linkLabel: string;
};

export function JetpackPluginsPreview( { featureText, link, linkLabel }: Props ) {
	return (
		<>
			<SitePreviewPaneContent>
				<div>{ featureText }</div>
				<div style={ { marginTop: '20px' } }>
					<Button href={ link } primary>
						{ linkLabel }
					</Button>
				</div>
			</SitePreviewPaneContent>
			<SitePreviewPaneFooter />
		</>
	);
}
