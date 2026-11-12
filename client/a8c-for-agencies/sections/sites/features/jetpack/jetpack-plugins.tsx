import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';

type Props = {
	featureText: string | React.ReactNode;
	link: string;
	linkLabel: string;
	captionText: string;
};

export function JetpackPluginsPreview( { featureText, link, linkLabel, captionText }: Props ) {
	const translate = useTranslate();
	return (
		<>
			<DocumentHead title={ translate( 'Plugins' ) } />
			<div className="site-preview-pane__plugins-content">
				<h3>{ featureText }</h3>
				<p className="site-preview-pane__plugins-caption">{ captionText }</p>
				<div style={ { marginTop: '24px' } }>
					<Button href={ link } primary target="_blank">
						{ linkLabel } ↗
					</Button>
				</div>
			</div>
		</>
	);
}
