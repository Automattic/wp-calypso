import { A4A_AGENCY_TIER_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { preventWidows } from 'calypso/lib/formatting';

const getTierPermissionData = (
	section: string,
	translate: ( key: string, args?: Record< string, unknown > ) => string
) => {
	const content: Record<
		string,
		{
			title: string;
			content: {
				heading: string;
				description: string;
				buttonProps: { text: string; href: string };
			};
		}
	> = {
		'a8c-for-agencies-partner-directory': {
			title: translate( 'Partner Directory' ),
			content: {
				heading: preventWidows(
					translate( "Reach the next tier to be showcased in Automattic's partner directories." )
				),
				description: translate(
					"Agency Partners and Pro Agency Partners get to be included in Automatic's directories. Pro Agency Partners also get co-marketing opportunities."
				),
				buttonProps: {
					text: translate( 'Learn more' ),
					href: A4A_AGENCY_TIER_LINK,
				},
			},
		},
	};
	return content?.[ section ];
};

export default getTierPermissionData;
