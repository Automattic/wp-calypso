import { Card, Button, Gridicon } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import isBloganuary from 'calypso/data/blogging-prompt/is-bloganuary';
import {
	useAIBloggingPrompts,
	mergePromptStreams,
} from 'calypso/data/blogging-prompt/use-ai-blogging-prompts';
import { useBloggingPrompts } from 'calypso/data/blogging-prompt/use-blogging-prompts';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import {
	SECTION_BLOGGING_PROMPT,
	SECTION_BLOGANUARY_BLOGGING_PROMPT,
} from 'calypso/my-sites/customer-home/cards/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import BellOffIcon from './bell-off-icon';
import PromptsNavigation from './prompts-navigation';

import './style.scss';

const BloggingPromptCard = ( { siteId, viewContext, showMenu, index } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const notificationSettingsLink = '/me/notifications' + ( siteSlug ? '#' + siteSlug : '' );
	const moment = useLocalizedMoment();

	const maxNumberOfPrompts = isBloganuary() ? 31 : 10;
	const today = moment().format( '--MM-DD' );
	const januaryDate = '--01-01';
	const startDate = isBloganuary() ? januaryDate : today;

	let { data: prompts } = useBloggingPrompts( siteId, startDate, maxNumberOfPrompts );
	// This will not do a request until we have the `isEnabled( 'calypso/ai-blogging-prompts' )` feature flag enabled.
	const { data: aiPrompts } = useAIBloggingPrompts( siteId );
	if ( prompts && aiPrompts && ! isBloganuary() ) {
		prompts = mergePromptStreams( prompts, aiPrompts );
	}

	const { skipCard } = useSkipCurrentViewMutation( siteId );

	if ( ! index && isBloganuary() ) {
		// get the offset for the day of the month.
		index = parseInt( moment().format( 'D' ) ) - 1;
	}

	if ( ! prompts ) {
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
		const cardToSkip = isBloganuary()
			? SECTION_BLOGANUARY_BLOGGING_PROMPT
			: SECTION_BLOGGING_PROMPT;
		skipCard( cardToSkip );
		dispatch(
			recordTracksEvent( getTracksPrefix() + 'task_skip', {
				task: cardToSkip,
			} )
		);
	};

	const renderMenu = () => {
		if ( ! showMenu ) {
			return;
		}
		return (
			<EllipsisMenu
				className="blogging-prompt__menu"
				position="bottom"
				key="blogging-prompt__menu" //`key` is necessary due to behavior of preventWidows function in CardHeading component.
			>
				<Button className="popover__menu-item" onClick={ hidePrompts }>
					<Gridicon icon="not-visible" className="gridicons-not-visible" />
					{ isBloganuary()
						? translate( 'Hide Bloganuary Prompt' )
						: translate( 'Hide Daily Prompts' ) }
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
			<Card
				className={ clsx( 'blogging-prompt__card', {
					'customer-home__card is-small-hero': viewContext === 'home',
				} ) }
			>
				<PromptsNavigation
					siteId={ siteId }
					prompts={ prompts }
					tracksPrefix={ getTracksPrefix() }
					index={ index }
					menu={ renderMenu() }
				/>
			</Card>
		</div>
	);
};

export default BloggingPromptCard;
