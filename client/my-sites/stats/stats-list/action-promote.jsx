import { blaze } from '@automattic/components/src/icons';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import {
	recordDSPEntryPoint,
	usePromoteWidget,
	PromoteWidgetStatus,
} from 'calypso/lib/promote-post';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';

const PromotePost = ( props ) => {
	const { moduleName, postId, onToggleVisibility } = props;

	const translate = useTranslate();
	const dispatch = useDispatch();

	const keyValue = 'post-' + postId;
	const { isModalOpen, value, openModal } = useRouteModal( 'blazepress-widget', keyValue );

	const selectedSiteId = useSelector( getSelectedSiteId );

	const site = useSelector( getSelectedSite );
	const { is_private, is_coming_soon } = site;
	const showPromotePost =
		usePromoteWidget() === PromoteWidgetStatus.ENABLED && ! is_private && ! is_coming_soon;

	const showDSPWidget = async ( event ) => {
		event.stopPropagation();
		onToggleVisibility( true );
		openModal();

		gaRecordEvent(
			'Stats',
			'Clicked on Promote Post Widget Button in ' + moduleName + ' List Action Menu'
		);

		dispatch( recordDSPEntryPoint( 'mysites_stats_posts-and-pages_speaker-button' ) );
	};

	return (
		<>
			{ showPromotePost && (
				<li className="stats-list__item-action module-content-list-item-action">
					<BlazePressWidget
						isVisible={ isModalOpen && value === keyValue }
						siteId={ selectedSiteId }
						postId={ postId }
						keyValue={ keyValue }
					/>
					<button
						onClick={ showDSPWidget }
						rel="noopener noreferrer"
						className="stats-list__item-action-wrapper stats-list__item-action-promote module-content-list-item-action-wrapper"
						title={ translate( 'Promote your post with our ad delivery system.', {
							textOnly: true,
							context: 'Stats action tooltip: Opens a pop-out post promotion tool',
						} ) }
						aria-label={ translate( 'Promote your post with our ad delivery system.', {
							textOnly: true,
							context: 'Stats ARIA label: Opens a pop-out post promotion tool',
						} ) }
					>
						<Icon className="stats-icon" icon={ blaze } size={ 18 } />

						<span className="stats-list__item-action-label module-content-list-item-action-label module-content-list-item-action-label-view">
							{ translate( 'Promote', { context: 'Stats: List item action to view content' } ) }
						</span>
					</button>
				</li>
			) }
		</>
	);
};

export default PromotePost;
