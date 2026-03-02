import { __ } from '@wordpress/i18n';
import { published } from '@wordpress/icons';
import OverviewCard from '../../components/overview-card';
import type { Site } from '@automattic/api-core';

const CARD_PROPS = {
	title: __( 'Visibility' ),
	tracksId: 'site-overview-visibility-ciab',
};

export default function VisibilityCardCiab( { site }: { site: Site } ) {
	const link = site.options?.admin_url
		? `${ site.options.admin_url }admin.php?page=next-admin&p=%2Fwoocommerce%2Fsettings%2Fgeneral`
		: undefined;

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			link={ link }
			icon={ published }
			heading={ __( 'Public' ) }
			description={ __( 'Anyone can view your site.' ) }
			intent="success"
		/>
	);
}
