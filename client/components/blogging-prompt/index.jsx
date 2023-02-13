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
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import BellOffIcon from './bell-off-icon';
import LightbulbIcon from './lightbulb-icon';
import PromptsNavigation from './prompts-navigation';

import './style.scss';

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
	const dispatch = useDispatch();
	const translate = useTranslate();
	const primarySiteId = useSelector( ( state ) => getPrimarySiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const notificationSettingsLink = '/me/notifications' + ( siteSlug ? '#' + siteSlug : '' );
	const maxNumberOfPrompts = 10;
	const { data: prompts } = useBloggingPrompts( siteId || primarySiteId, maxNumberOfPrompts );
	const { skipCard } = useSkipCurrentViewMutation( siteId );

	if ( prompts === undefined ) {
		return null;
	}

	if ( tracksContext !== 'reader' ) {
		tracksContext = 'home';
	}
	const hidePrompts = () => {
		skipCard( SECTION_BLOGGING_PROMPT );
		dispatch(
			recordTracksEvent( 'calypso_customer_home_task_skip', {
				task: SECTION_BLOGGING_PROMPT,
				context: tracksContext,
			} )
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
			</Card>
		</div>
	);
};

export default BloggingPromptCard;
