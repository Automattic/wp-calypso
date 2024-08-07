import { useTranslate } from 'i18n-calypso';
import Banner from 'calypso/components/banner';
import InfoPopover from 'calypso/components/info-popover';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import SiteLevelProfileModal from '../site-level-profile-modal';

import './style.scss';

export default function SiteLevelProfileBanner() {
	const translate = useTranslate();
	const siteCount = useSelector( ( state ) => getCurrentUserSiteCount( state ) );

	if ( siteCount === 0 ) {
		return null;
	}

	return (
		<Banner
			className="site-level-profile-banner"
			icon="info-outline"
			title={ translate(
				'The following settings are your public WordPress.com profile.{{infoPopover/}}',
				{
					components: {
						infoPopover: (
							<InfoPopover className="site-level-profile-banner__popover">
								{ translate(
									'This is your profile that will be shown publicly when you comment on another WordPress.com blog.'
								) }
							</InfoPopover>
						),
					},
				}
			) }
			description={
				<>
					{ translate(
						"To manage your profile on a specific site instead, {{modal}}click here{{/modal}} to visit the site's profile page.",
						{
							components: {
								br: <br />,
								modal: <SiteLevelProfileModal />,
							},
						}
					) }
				</>
			}
		/>
	);
}
