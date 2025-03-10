import { useTranslate } from 'i18n-calypso';
import StatsInfoArea from 'calypso/my-sites/stats/features/modules/shared/stats-info-area';

const UTMTitleInfoNode = ( { supportUrl }: { supportUrl: string } ) => {
	const translate = useTranslate();

	return (
		<StatsInfoArea isNew>
			{ translate(
				'Track your campaign {{link}}UTM performance data{{/link}}. Generate URL codes with our builder.',
				{
					comment: '{{link}} links to support documentation.',
					components: {
						link: <a target="_blank" rel="noreferrer" href={ supportUrl } />,
					},
					context: 'Stats: Popover information when the UTM module has data',
				}
			) }
		</StatsInfoArea>
	);
};

export default UTMTitleInfoNode;
