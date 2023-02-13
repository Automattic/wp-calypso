import { Card, Button, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { sortBy } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import { useBloggingPrompts } from 'calypso/data/blogging-prompt/use-blogging-prompts';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import { SECTION_BLOGGING_PROMPT } from 'calypso/my-sites/customer-home/cards/constants';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import BellOffIcon from './bell-off-icon';
import LightbulbIcon from './lightbulb-icon';
import PromptsNavigation from './prompts-navigation';

import './style.scss';

const BloggingPromptCard = () => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	let sites = useSelector( ( state ) => getSitesItems( state ) );
	let siteId = selectedSiteId;

	// Set selected site ID to first site with write site_intent
	if ( siteId === null ) {
		sites = sortBy( sites, [ 'ID' ] );
		const blogs = Object.values( sites ).filter( ( site ) => {
			return site.options?.site_intent === 'write';
		} );
		if ( blogs.length > 0 ) {
			siteId = blogs[ 0 ].ID;
			dispatch( setSelectedSiteId( siteId ) );
		}
	}

	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const maxNumberOfPrompts = 10;
	const { data: prompts } = useBloggingPrompts( siteId, maxNumberOfPrompts );

	const { skipCard } = useSkipCurrentViewMutation( siteId );

	if ( prompts === undefined ) {
		return null;
	}
	const hidePrompts = () => {
		skipCard( SECTION_BLOGGING_PROMPT );
		dispatch(
			recordTracksEvent( 'calypso_customer_home_task_skip', {
				task: SECTION_BLOGGING_PROMPT,
			} )
		);
	};

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
				<PromptsNavigation prompts={ prompts } />
			</Card>
		</div>
	);
};

export default BloggingPromptCard;
