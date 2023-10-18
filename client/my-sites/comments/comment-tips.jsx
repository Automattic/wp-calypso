import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelTitle from 'calypso/components/action-panel/title';
import { useDispatch } from 'calypso/state';
import { savePreference } from 'calypso/state/preferences/actions';

export const COMMENTS_TIPS_DISMISSED_PREFERENCE = 'dismissible-comments-moderation-tips';

const CommentTips = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const dismissTips = () => {
		dispatch( savePreference( COMMENTS_TIPS_DISMISSED_PREFERENCE, true ) );
		recordTracksEvent( 'calypso_comments_moderation_tips_dismissed' );
	};

	useEffect( () => {
		recordTracksEvent( 'calypso_comments_moderation_tips_viewed' );
	}, [] );

	return (
		<ActionPanel className="comments-tips__action-panel">
			<Button
				className="comments-tips__dismiss-button"
				onClick={ dismissTips }
				borderless
				title={ translate( 'Dismiss tips' ) }
			>
				<Gridicon icon="cross" size="24px" />
			</Button>
			<ActionPanelBody>
				<ActionPanelFigure align="left">
					<img
						src="/calypso/images/wordpress/logo-stars.svg"
						width="170"
						height="143"
						alt="WordPress logo"
					/>
				</ActionPanelFigure>
				<ActionPanelTitle>{ translate( 'A few helpful tips' ) }</ActionPanelTitle>
				<ul>
					<li>
						{ translate(
							'Comments are the best part of blogging, but you decide which comments get published.'
						) }
					</li>
					<li>
						{ translate(
							'Spammers and odd folks will want to be on your post so look at their links and if it seems scammy, don’t hesitate to delete or spam the comment.'
						) }
					</li>
					<li>
						{ translate(
							'When real people show up, approve the comment and reply to them! Engage them, this is your community.'
						) }
					</li>
				</ul>
			</ActionPanelBody>
		</ActionPanel>
	);
};

export default CommentTips;
