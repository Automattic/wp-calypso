import { Card, Button, Gridicon } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import { useBloggingPrompt } from 'calypso/data/blogging-prompt/use-blogging-prompt';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import { SECTION_BLOGGING_PROMPT } from 'calypso/my-sites/customer-home/cards/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getEditorUrl } from 'calypso/state/selectors/get-editor-url';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import BellOffIcon from './bell-off-icon';
import LightbulbIcon from './lightbulb-icon';
import { PromptsNavigation } from './prompts-navigation';

import './style.scss';

const BloggingPromptCard = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const editorUrl = useSelector( ( state ) => getEditorUrl( state, siteId ) );
	const { data: prompt } = useBloggingPrompt( siteId );
	const { skipCard } = useSkipCurrentViewMutation( siteId );

	const hidePrompts = () => {
		skipCard( SECTION_BLOGGING_PROMPT );
		dispatch(
			recordTracksEvent( 'calypso_customer_home_task_skip', {
				task: SECTION_BLOGGING_PROMPT,
			} )
		);
	};

	const trackBloggingPromptClick = () => {
		dispatch(
			recordTracksEvent( `calypso_customer_home_answer_prompt`, {
				site_id: siteId,
				prompt_id: prompt?.id,
			} )
		);
	};

	if ( ! prompt ) {
		return null;
	}

	const newPostLink = addQueryArgs( editorUrl, {
		answer_prompt: prompt.id,
	} );
	const notificationSettingsLink = `/me/notifications#${ siteSlug }`;

	return (
		<div className="blogging-prompt">
			<Card className={ classnames( 'customer-home__card', 'blogging-prompt__card' ) }>
				<CardHeading>
					<LightbulbIcon />
					<span className="blogging-prompt__heading-text">
						{ translate( 'Daily writing prompt' ) }
					</span>
					{ /* `key` is necessary due to behavior of preventWidows function in CardHeading component. */ }
					<EllipsisMenu
						className="blogging-prompt__menu"
						position="bottom"
						key="blogging-prompt__menu"
					>
						<Button className="popover__menu-item" onClick={ hidePrompts }>
							<Gridicon icon="not-visible" className="gridicons-not-visible" />
							{ translate( 'Hide Daily Prompts' ) }
						</Button>
						<Button className="popover__menu-item" href={ notificationSettingsLink }>
							<BellOffIcon />
							{ translate( 'Manage Notifications' ) }
						</Button>
					</EllipsisMenu>
				</CardHeading>
				<PromptsNavigation
					direction="back"
					flowName="writing-prompt-back"
					stepName={ prompt.id.toString() }
					translate={ translate }
				/>
				<div className="blogging-prompt__prompt-text">{ prompt.text }</div>
				<PromptsNavigation
					direction="forward"
					flowName="writing-prompt-forward"
					stepName={ prompt.id.toString() }
					translate={ translate }
				/>
				<Button href={ newPostLink } onClick={ trackBloggingPromptClick } target="_blank">
					{ translate( 'Post Answer', {
						comment:
							'"Post" here is a verb meaning "to publish", as in "post an answer to this writing prompt"',
					} ) }
				</Button>
			</Card>
		</div>
	);
};

export default BloggingPromptCard;
