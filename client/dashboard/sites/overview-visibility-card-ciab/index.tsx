import { __ } from '@wordpress/i18n';
import { published } from '@wordpress/icons';
import { launch } from '../../components/icons';
import OverviewCard from '../../components/overview-card';
import type { Site } from '@automattic/api-core';

const CARD_PROPS = {
	title: __( 'Store Visibility' ),
	tracksId: 'site-overview-visibility-ciab',
};

export default function VisibilityCardCiab( { site }: { site: Site } ) {
	const link = site.options?.admin_url
		? `${ site.options.admin_url }admin.php?page=next-admin&p=%2Fwoocommerce%2Fsettings%2Fgeneral`
		: undefined;

	if ( site.is_coming_soon ) {
		return (
			<OverviewCard
				{ ...CARD_PROPS }
				link={ link }
				icon={ launch }
				heading={ __( 'Coming Soon' ) }
				description={ __(
					'Your site is hidden from visitors behind a “Coming Soon” notice until it is ready for viewing.'
				) }
			/>
		);
	}

	return (
		<OverviewCard
			{ ...CARD_PROPS }
			link={ link }
			icon={ published }
			heading={ __( 'Live' ) }
			description={ __( 'Your store is visible to everyone.' ) }
			intent="success"
		/>
	);
}
