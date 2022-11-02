import { Card, Button } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import useWritingPrompt from 'calypso/data/writing-prompt/use-writing-prompt';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import LightbulbIcon from './lightbulb-icon';
import './style.scss';

export const WritingPromptCard = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const prompt = useWritingPrompt( selectedSiteId );

	const trackWritingPromptClick = () => {
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
	return (
		<div className="writing-prompt">
			<Card className={ classnames( 'customer-home__card', 'writing-prompt__card' ) }>
				<CardHeading>
					<LightbulbIcon />
					{ translate( 'Daily Prompt' ) }
				</CardHeading>
				<div className="writing-prompt__prompt-text">{ prompt.text }</div>
				<Button href={ `/post/${ siteSlug }` } onClick={ trackWritingPromptClick } target="_blank">
					{ translate( 'Post Answer' ) }
				</Button>
			</Card>
		</div>
	);
};

export default WritingPromptCard;
