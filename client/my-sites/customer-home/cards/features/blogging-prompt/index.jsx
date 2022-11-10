import { Card, Button } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import useBloggingPrompt from 'calypso/data/blogging-prompt/use-blogging-prompt';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
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

	return (
		<div className="blogging-prompt">
			<Card className={ classnames( 'customer-home__card', 'blogging-prompt__card' ) }>
				<CardHeading>
					<LightbulbIcon />
					{ translate( 'Daily Prompt' ) }
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
