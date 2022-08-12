import config from '@automattic/calypso-config';
import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { recordDSPEntryPoint, showDSPWidgetModal } from 'calypso/lib/promote-post';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PromotePost = ( props ) => {
	const { moduleName, postId } = props;

	const translate = useTranslate();
	const dispatch = useDispatch();

	const showPromotePost = config.isEnabled( 'promote-post' );

	const selectedSiteId = useSelector( getSelectedSiteId );

	const showDSPWidget = async ( event ) => {
		event.stopPropagation();
		await showDSPWidgetModal( selectedSiteId, postId );

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
						<Gridicon icon="speaker" size={ 18 } />
						<span className="stats-list__item-action-label module-content-list-item-action-label module-content-list-item-action-label-view">
							{ translate( 'View', { context: 'Stats: List item action to view content' } ) }
						</span>
					</button>
				</li>
			) }
		</>
	);
};

export default PromotePost;
