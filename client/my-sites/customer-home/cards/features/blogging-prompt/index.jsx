import { Card, Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import useBloggingPrompt from 'calypso/data/blogging-prompt/use-blogging-prompt';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import BellOffIcon from './bell-off-icon';
import LightbulbIcon from './lightbulb-icon';

import './style.scss';

export const BloggingPromptCard = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const prompt = useBloggingPrompt( selectedSiteId );

	const trackBloggingPromptClick = () => {
		dispatch(
			recordTracksEvent( `calypso_customer_home_answer_prompt`, {
				site_id: selectedSiteId,
				prompt_id: prompt?.id,
				prompt_text: prompt?.text,
			} )
		);
	};

	if ( ! prompt ) {
		return null;
	}

	const newPostLink = `/post/${ siteSlug }?answer_prompt=${ prompt.id }`;
	const notificationSettingsLink = `/me/notifications#${ siteSlug }`;
	return (
		<div className="blogging-prompt">
			<Card className={ classnames( 'customer-home__card', 'blogging-prompt__card' ) }>
				<CardHeading>
					<LightbulbIcon />
					{ translate( 'Daily Prompt' ) }
					<EllipsisMenu className="blogging-prompt__menu" position="bottom">
						<Button className="popover__menu-item">
							<Gridicon icon="not-visible" className="gridicons-not-visible" />
							{ translate( 'Hide Daily Prompts' ) }
						</Button>
						<Button className="popover__menu-item" href={ notificationSettingsLink }>
							<BellOffIcon />
							{ translate( 'Manage Notifications' ) }
						</Button>
					</EllipsisMenu>
				</CardHeading>
				<div className="blogging-prompt__prompt-text">{ prompt.text }</div>
				<Button href={ newPostLink } onClick={ trackBloggingPromptClick } target="_blank">
					{ translate( 'Post Answer' ) }
				</Button>
			</Card>
		</div>
	);
};

export default BloggingPromptCard;
