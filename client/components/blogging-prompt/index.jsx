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

const BloggingPromptCard = ( { siteId, viewContext, showMenu } ) => {
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
		}
		return 'calypso_reader_';
	};

	const hidePrompts = () => {
		skipCard( SECTION_BLOGGING_PROMPT );
		dispatch(
			recordTracksEvent( getTracksPrefix() + 'task_skip', {
				task: SECTION_BLOGGING_PROMPT,
				location: viewContext,
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
					<span className="blogging-prompt__heading-text">
						{ translate( 'Daily writing prompt' ) }
					</span>
					{ showMenu && renderMenu() }
				</CardHeading>
				<PromptsNavigation
					siteId={ siteId }
					prompts={ prompts }
					viewContext={ viewContext }
					tracksPrefix={ getTracksPrefix() }
				/>
			</Card>
		</div>
	);
};

export default BloggingPromptCard;
