import { Tooltip } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { forwardRef } from 'react';

interface Props {
	siteId: number;
	showTooltip: boolean;
}

// @todo: We could make the component more generic by passing the text as a prop.
const SiteTableTooltip = ( { siteId, showTooltip }: Props, ref: any ) => {
	const translate = useTranslate();

	const tooltipId = `site-table-expand-tooltip-${ siteId }`;

	return (
		<Tooltip
			id={ tooltipId }
			context={ ref.current }
			isVisible={ showTooltip }
			position="bottom left"
			className="sites-overview__tooltip"
		>
			{ translate( 'Click here for more info' ) }
		</Tooltip>
	);
};

export default forwardRef( SiteTableTooltip );
