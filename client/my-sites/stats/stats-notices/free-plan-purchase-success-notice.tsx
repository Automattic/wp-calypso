import config from '@automattic/calypso-config';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { StatsNoticeProps } from './types';

const getStatsPurchaseURL = ( siteId: number | null ) => {
	const purchasePath = `/stats/purchase/${ siteId }`;
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	if ( ! isOdysseyStats ) {
		return purchasePath;
	}
	return `https://wordpress.com${ purchasePath }`;
};

const FreePlanPurchaseSuccessJetpackStatsNotice = ( { siteId }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );

	const dismissNotice = () => {
		// TODO: Remove the query string from the window URL without a refresh.
		setNoticeDismissed( true );
	};

	if ( noticeDismissed ) {
		return null;
	}

	return (
		<div className="inner-notice-container has-odyssey-stats-bg-color">
			<NoticeBanner
				level="success"
				title={ translate( 'Thank you for using Jetpack Stats!' ) }
				onClose={ dismissNotice }
			>
				{ translate(
					'{{p}}We appreciate your continued support. If you want to access upcoming features, {{jetpackStatsProductLink}} please consider upgrading{{/jetpackStatsProductLink}}.{{/p}}',
					{
						components: {
							p: <p />,
							jetpackStatsProductLink: (
								<a
									className="notice-banner__action-link"
									href={ getStatsPurchaseURL( siteId ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
				) }
			</NoticeBanner>
		</div>
	);
};

export default FreePlanPurchaseSuccessJetpackStatsNotice;
