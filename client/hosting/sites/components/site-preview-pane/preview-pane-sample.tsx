import { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
	tabName: string;
};

const PreviewPaneSample = ( { site, tabName }: Props ) => {
	return (
		<div className="dotcom-preview-pane-content">
			<h2>
				<b>{ tabName }</b>
			</h2>
			Preview Pane
			<br />
			<b>{ site.slug }</b>
		</div>
	);
};

export default PreviewPaneSample;
