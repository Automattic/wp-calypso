import { Button } from '@automattic/components';
import { external, Icon } from '@wordpress/icons';
import SitePreviewPaneContent from '../../site-preview-pane/site-preview-pane-content';
import SitePreviewPaneFooter from '../../site-preview-pane/site-preview-pane-footer';

type Props = {
	featureText: string | React.ReactNode;
	link: string;
	linkLabel: string;
	captionText: string;
};

export function JetpackPluginsPreview( { featureText, link, linkLabel, captionText }: Props ) {
	return (
		<>
			<SitePreviewPaneContent>
				<div className="site-preview-pane__plugins-content">
					<h3>{ featureText }</h3>
					<p className="site-preview-pane__plugins-caption">{ captionText }</p>
					<div style={ { marginTop: '24px' } }>
						<Button href={ link } primary target="_blank">
							{ linkLabel }
							<Icon
								icon={ external }
								size={ 16 }
								className="site-preview-pane__plugins-icon"
								viewBox="0 0 20 20"
							/>
						</Button>
					</div>
				</div>
			</SitePreviewPaneContent>
			<SitePreviewPaneFooter />
		</>
	);
}
