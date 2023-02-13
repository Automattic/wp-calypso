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

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD:client/my-sites/customer-home/cards/features/blogging-prompt/index.jsx
const BloggingPromptCard = ( { index } ) => {
=======
const BloggingPromptCard = ( { context } ) => {
>>>>>>> bb5af98738 (Move blogging prompt card into components directory):client/components/blogging-prompt/index.jsx
=======
const BloggingPromptCard = ( { tracksContext } ) => {
>>>>>>> 84b1447c2c (change prop name to tracksContext)
=======
const BloggingPromptCard = ( { siteId, tracksContext } ) => {
>>>>>>> 762bf35932 (refactor how we handle siteId)
=======
const BloggingPromptCard = ( { siteId, viewContext } ) => {
>>>>>>> a59fd46bb8 (Pass site ID from postlifecyle and use viewContext)
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

	if ( viewContext !== 'reader' ) {
		viewContext = 'home';
	}
	const hidePrompts = () => {
		skipCard( SECTION_BLOGGING_PROMPT );
		dispatch(
			recordTracksEvent( 'calypso_customer_home_task_skip', {
				task: SECTION_BLOGGING_PROMPT,
				context: viewContext,
			} )
		);
	};

	const renderMenu = () => {
		// Only render the menu in home view context
		return (
			viewContext === 'home' && (
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
			)
		);
	};

	return (
		<div className="blogging-prompt">
			<Card className={ classnames( 'customer-home__card', 'blogging-prompt__card' ) }>
				<CardHeading>
					<LightbulbIcon />
					<span className="blogging-prompt__heading-text">
						{ translate( 'Daily writing prompt' ) }
					</span>
					{ renderMenu() }
				</CardHeading>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD:client/my-sites/customer-home/cards/features/blogging-prompt/index.jsx
				<PromptsNavigation prompts={ prompts } index={ index } />
=======
				<PromptsNavigation prompts={ prompts } context={ context } />
>>>>>>> bb5af98738 (Move blogging prompt card into components directory):client/components/blogging-prompt/index.jsx
=======
				<PromptsNavigation prompts={ prompts } tracksContext={ tracksContext } />
>>>>>>> 84b1447c2c (change prop name to tracksContext)
=======
				<PromptsNavigation siteId={ siteId } prompts={ prompts } tracksContext={ tracksContext } />
>>>>>>> 762bf35932 (refactor how we handle siteId)
=======
				<PromptsNavigation siteId={ siteId } prompts={ prompts } viewContext={ viewContext } />
>>>>>>> a59fd46bb8 (Pass site ID from postlifecyle and use viewContext)
			</Card>
		</div>
	);
};

export default BloggingPromptCard;
