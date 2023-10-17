import { useTranslate } from 'i18n-calypso';
import ActionPanel from 'calypso/components/action-panel';
import ActionPanelBody from 'calypso/components/action-panel/body';
import ActionPanelFigure from 'calypso/components/action-panel/figure';
import ActionPanelTitle from 'calypso/components/action-panel/title';

const CommentTips = () => {
	const translate = useTranslate();

	return (
		<ActionPanel className="comments-tips__action-panel">
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
