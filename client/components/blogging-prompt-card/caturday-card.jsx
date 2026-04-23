import { Card, Button } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import LightbulbIcon from './lightbulb-icon';

const CATURDAY_PROMPT_ID = 1917;
const CAT_IMAGE_URL = 'https://wpcom.files.wordpress.com/2026/04/cat-1.png';

const CaturdayCard = ( { siteId } ) => {
	const translate = useTranslate();
	const editorUrl = useSelector( ( state ) => getEditorUrl( state, siteId ) );
	const newPostLink = addQueryArgs( siteId ? editorUrl : '/post', {
		answer_prompt: CATURDAY_PROMPT_ID,
	} );

	return (
		<Card className="blogging-prompt__card caturday-prompt__card customer-home__card is-small-hero">
			<div className="blogging-prompt__prompt-container">
				<CardHeading>
					<LightbulbIcon />
					<span className="blogging-prompt__heading-text" key="caturday-heading-text">
						{ translate( "It's Caturday!" ) }
					</span>
				</CardHeading>
				<div className="caturday-prompt__body">
					<div className="caturday-prompt__content">
						<p className="blogging-prompt__prompt-text">{ translate( 'Post a cat photo' ) }</p>
						<div className="blogging-prompt__prompt-answers">
							<Button href={ newPostLink } className="blogging-prompt__new-post-link">
								{ translate( 'Post Answer', {
									comment:
										'"Post" here is a verb meaning "to publish", as in "post an answer to this writing prompt"',
								} ) }
							</Button>
						</div>
					</div>
					<img className="caturday-prompt__cat-image" src={ CAT_IMAGE_URL } alt="" />
				</div>
			</div>
		</Card>
	);
};

export default CaturdayCard;
