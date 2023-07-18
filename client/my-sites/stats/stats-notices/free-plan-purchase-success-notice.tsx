import config from '@automattic/calypso-config';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import useNoticeVisibilityQuery from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { StatsNoticeProps } from './types';

const getStatsPurchaseURL = ( siteId: number | null ) => {
	const purchasePath = `/stats/purchase/${ siteId }?flags=stats/paid-stats`;
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	if ( ! isOdysseyStats ) {
		return purchasePath;
	}
	return `https://wordpress.com${ purchasePath }`;
};

const FreePlanPurchaseSuccessJetpackStatsNotice = ( { siteId }: StatsNoticeProps ) => {
	const translate = useTranslate();
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );
	const { data: showNotice } = useNoticeVisibilityQuery( siteId, 'free_plan_purchase_success' );
	const { mutateAsync: postponeNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'free_plan_purchase_success',
		'postponed',
		30 * 24 * 3600
	);

	const dismissNotice = () => {
		setNoticeDismissed( true );
		postponeNoticeAsync();
	};

	if ( noticeDismissed || ! showNotice ) {
		// return null; this is for testing purposes. TODO uncomment
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
