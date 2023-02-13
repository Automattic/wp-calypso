import { Card, Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import { useBloggingPrompts } from 'calypso/data/blogging-prompt/use-blogging-prompts';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import { SECTION_BLOGGING_PROMPT } from 'calypso/my-sites/customer-home/cards/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import BellOffIcon from './bell-off-icon';
import LightbulbIcon from './lightbulb-icon';
import PromptsNavigation from './prompts-navigation';

import './style.scss';

<<<<<<< HEAD:client/components/blogging-prompt-card/index.jsx
const BloggingPromptCard = ( { siteId, viewContext, showMenu } ) => {
=======
const BloggingPromptCard = ( { index } ) => {
>>>>>>> 93c3eca481 (Pass index of prompts to card):client/my-sites/customer-home/cards/features/blogging-prompt/index.jsx
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const notificationSettingsLink = '/me/notifications' + ( siteSlug ? '#' + siteSlug : '' );
	const maxNumberOfPrompts = 10;
	const { data: prompts } = useBloggingPrompts( siteId, maxNumberOfPrompts );
	const { skipCard } = useSkipCurrentViewMutation( siteId );

	if ( prompts === undefined ) {
		return null;
	}

	const getTracksPrefix = () => {
		if ( viewContext === 'home' ) {
			return 'calypso_customer_home_';
		} else if ( viewContext === 'reader' ) {
			return 'calypso_reader_';
		}

		// eslint-disable-next-line no-console
		console.error( 'A valid viewContext is required for the BloggingPromptCard component.' );
	};

	const hidePrompts = () => {
		skipCard( SECTION_BLOGGING_PROMPT );
		dispatch(
			recordTracksEvent( getTracksPrefix() + 'task_skip', {
				task: SECTION_BLOGGING_PROMPT,
			} )
		);
	};

	const renderMenu = () => {
		return (
			<EllipsisMenu
				className="blogging-prompt__menu"
				position="bottom"
				key="blogging-prompt__menu" //`key` is necessary due to behavior of preventWidows function in CardHeading component.
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
		);
	};

	return (
		<div className="blogging-prompt">
			<Card className={ classnames( 'customer-home__card', 'blogging-prompt__card' ) }>
				<CardHeading>
					<LightbulbIcon />
					{ /*`key` is necessary due to behavior of preventWidows function in CardHeading component.*/ }
					<span className="blogging-prompt__heading-text" key="blogging-prompt__heading-text">
						{ translate( 'Daily writing prompt' ) }
					</span>
					{ showMenu && renderMenu() }
				</CardHeading>
<<<<<<< HEAD:client/components/blogging-prompt-card/index.jsx
				<PromptsNavigation
					siteId={ siteId }
					prompts={ prompts }
					tracksPrefix={ getTracksPrefix() }
				/>
=======
				<PromptsNavigation prompts={ prompts } index={ index } />
>>>>>>> 93c3eca481 (Pass index of prompts to card):client/my-sites/customer-home/cards/features/blogging-prompt/index.jsx
			</Card>
		</div>
	);
};

export default BloggingPromptCard;
