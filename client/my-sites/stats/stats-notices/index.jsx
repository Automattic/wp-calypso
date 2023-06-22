import config from '@automattic/calypso-config';
import NoticeBanner from '@automattic/components/src/notice-banner';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import version_compare from 'calypso/lib/version-compare';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import useNoticeVisibilityQuery from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { updateStatsNoticeStatusDirect } from 'calypso/state/sites/notices/actions';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';
import hasNewStatsFeedbackNotice from 'calypso/state/sites/selectors/has-new-stats-feedback-notice';
import hasOptOutNewStatsNotice from 'calypso/state/sites/selectors/has-opt-out-new-stats-notice';

import './style.scss';

/**
 * TODO: group code to separate notice components
 */
function BaseStatsNotices( {
	noticeDismissed,
	isOdysseyStats,
	showOptOutNotice,
	dismissOptOutNotice,
	showFeedbackNotice,
	dismissFeedbackNotice,
	onTakeSurveyClick,
	onRemindMeLaterClick,
} ) {
	const translate = useTranslate();

	return (
		! noticeDismissed && (
			<>
				{ isOdysseyStats && showOptOutNotice && (
					<div className="inner-notice-container has-odyssey-stats-bg-color">
						<NoticeBanner
							level="success"
							title={ translate( 'Welcome to the new Jetpack Stats!' ) }
							onClose={ dismissOptOutNotice }
						>
							{ translate(
								'{{p}}Enjoy a more modern and mobile friendly experience with new stats and insights to help you grow your site.{{/p}}{{p}}If you prefer to continue using the traditional stats, {{manageYourSettingsLink}}manage your settings{{/manageYourSettingsLink}}.{{/p}}',
								{
									components: {
										p: <p />,
										manageYourSettingsLink: (
											<a href="/wp-admin/admin.php?page=jetpack#/settings?term=stats" />
										),
									},
								}
							) }
						</NoticeBanner>
					</div>
				) }
				{ isOdysseyStats && showFeedbackNotice && (
					<div className="inner-notice-container has-odyssey-stats-bg-color">
						<NoticeBanner
							level="info"
							title={ translate( "We'd love to hear your thoughts on the new Stats" ) }
							onClose={ dismissFeedbackNotice }
						>
							{ translate(
								"{{p}}Now that you've gotten familiar with the new Jetpack Stats, we'd love to hear about your experience so we can continue to shape Jetpack to meet your needs.{{/p}}{{p}}{{takeSurveyButton}}Take quick survey{{/takeSurveyButton}} {{remindMeLaterLink}}Remind me later{{/remindMeLaterLink}}{{/p}}",
								{
									components: {
										p: <p />,
										takeSurveyButton: (
											<button
												type="button"
												className="notice-banner__action-button"
												onClick={ onTakeSurveyClick }
											/>
										),
										remindMeLaterLink: (
											<button
												className="notice-banner__action-link"
												onClick={ onRemindMeLaterClick }
											/>
										),
									},
								}
							) }
						</NoticeBanner>
					</div>
				) }
			</>
		)
	);
}

/**
 * New notices aim to support Calypso and Odyssey stats.
 * New notices are based on async API call and hence is faster than the old notices.
 */
function NewStatsNotices( { siteId, isOdysseyStats } ) {
	const [ noticeDismissed, setNoticeDismissed ] = useState( false );

	const { data: showOptOutNotice } = useNoticeVisibilityQuery( siteId, 'opt_out_new_stats' );
	const { data: showFeedbackNotice } = useNoticeVisibilityQuery( siteId, 'new_stats_feedback' );

	const { mutateAsync: dismissNewStatsFeedbackAsync } = useNoticeVisibilityMutation(
		siteId,
		'new_stats_feedback'
	);
	const { mutateAsync: dismissOptOutNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'opt_out_new_stats'
	);
	const { mutateAsync: dismissFeedbackNoticeAsync } = useNoticeVisibilityMutation(
		siteId,
		'new_stats_feedback'
	);
	const { mutateAsync: postponeNewStatsFeedbackAsync } = useNoticeVisibilityMutation(
		siteId,
		'new_stats_feedback',
		'postponed',
		30 * 24 * 3600
	);

	const onTakeSurveyClick = () => {
		dismissNewStatsFeedbackAsync();
		// Leave some time for the notice to be dismissed.
		setTimeout(
			() =>
				( window.location.href =
					'https://jetpack.com/redirect?source=new-jetpack-stats-usage-survey' ),
			250
		);
	};

	const dismissFeedbackNotice = () => {
		setNoticeDismissed( true );
		dismissFeedbackNoticeAsync();
	};

	const onRemindMeLaterClick = () => {
		setNoticeDismissed( true );
		postponeNewStatsFeedbackAsync();
	};

	const dismissOptOutNotice = () => {
		setNoticeDismissed( true );
		dismissOptOutNoticeAsync();
	};

	return (
		<BaseStatsNotices
			noticeDismissed={ noticeDismissed }
			isOdysseyStats={ isOdysseyStats }
			showOptOutNotice={ showOptOutNotice }
			dismissOptOutNotice={ dismissOptOutNotice }
			showFeedbackNotice={ showFeedbackNotice }
			dismissFeedbackNotice={ dismissFeedbackNotice }
			onTakeSurveyClick={ onTakeSurveyClick }
			onRemindMeLaterClick={ onRemindMeLaterClick }
		/>
	);
}

/**
 * Old StatsNotices is based on initial state and redux. It also only supports Odyssey stats.
 *
 * @param {*} param0
 * @returns
 */
function OldStatsNotices( { siteId, isOdysseyStats } ) {
	const dispatch = useDispatch();

	const [ noticeDismissed, setNoticeDismissed ] = useState( false );

	const showOptOutNotice = useSelector( ( state ) => hasOptOutNewStatsNotice( state, siteId ) );
	const showFeedbackNotice = useSelector( ( state ) => hasNewStatsFeedbackNotice( state, siteId ) );

	const updateNewStatsFeedBackStats =
		( id, status, url = null, postponed_for = 0 ) =>
		() => {
			if ( ! url ) {
				setNoticeDismissed( true );
			}
			dispatch( updateStatsNoticeStatusDirect( siteId, id, status, postponed_for ) );
			if ( url ) {
				// Leave some time for the notice to be dismissed.
				setTimeout( () => ( window.location.href = url ), 250 );
			}
		};
	const onTakeSurveyClick = updateNewStatsFeedBackStats(
		'new_stats_feedback',
		'dismissed',
		'https://jetpack.com/redirect?source=new-jetpack-stats-usage-survey'
	);
	const onRemindMeLaterClick = updateNewStatsFeedBackStats(
		'new_stats_feedback',
		'postponed',
		null,
		30 * 24 * 3600
	);
	const dismissOptOutNotice = updateNewStatsFeedBackStats( 'opt_out_new_stats', 'dismissed' );
	const dismissFeedbackNotice = updateNewStatsFeedBackStats( 'new_stats_feedback', 'dismissed' );

	return (
		<BaseStatsNotices
			noticeDismissed={ noticeDismissed }
			isOdysseyStats={ isOdysseyStats }
			showOptOutNotice={ showOptOutNotice }
			dismissOptOutNotice={ dismissOptOutNotice }
			showFeedbackNotice={ showFeedbackNotice }
			dismissFeedbackNotice={ dismissFeedbackNotice }
			onTakeSurveyClick={ onTakeSurveyClick }
			onRemindMeLaterClick={ onRemindMeLaterClick }
		/>
	);
}

/**
 * Return new or old StatsNotices components based on env.
 */
export default function StatsNotices( { siteId } ) {
	const statsAdminVersion = useSelector( ( state ) =>
		getJetpackStatsAdminVersion( state, siteId )
	);
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const supportNewStatsNotices =
		! isOdysseyStats ||
		!! ( statsAdminVersion && version_compare( statsAdminVersion, '0.10.0-alpha', '>=' ) );

	return supportNewStatsNotices ? (
		<NewStatsNotices siteId={ siteId } isOdysseyStats={ isOdysseyStats } />
	) : (
		<OldStatsNotices siteId={ siteId } isOdysseyStats={ isOdysseyStats } />
	);
}
