import { blaze } from '@automattic/components/src/icons';
import { Tooltip } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { usePromoteWidget, PromoteWidgetStatus } from 'calypso/lib/promote-post';
import { useRouteModal } from 'calypso/lib/route-modal';
import useOpenPromoteWidget from 'calypso/my-sites/promote-post-i2/hooks/use-open-promote-widget';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const PromotePost = ( props ) => {
	const { moduleName, postId, onToggleVisibility } = props;

	const translate = useTranslate();

	const keyValue = 'post-' + postId;
	const { isModalOpen, value } = useRouteModal( 'blazepress-widget', keyValue );
	const openPromoteModal = useOpenPromoteWidget( {
		keyValue,
		entrypoint: 'mysites_stats_posts-and-pages_speaker-button',
		external: true,
	} );

	const selectedSiteId = useSelector( getSelectedSiteId );
	const showPromotePost = usePromoteWidget() === PromoteWidgetStatus.ENABLED;

	const showDSPWidget = async ( event ) => {
		event.stopPropagation();
		onToggleVisibility( true );
		openPromoteModal();

		gaRecordEvent(
			'Stats',
			'Clicked on Promote Post Widget Button in ' + moduleName + ' List Action Menu'
		);
	};

	const title = translate( 'Promote', {
		textOnly: true,
		context: 'Stats action tooltip: Opens a pop-out post promotion tool',
	} );

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
					<Tooltip position="top" text={ title }>
						<button
							onClick={ showDSPWidget }
							rel="noopener noreferrer"
							className="stats-list__item-action-wrapper stats-list__item-action-promote module-content-list-item-action-wrapper"
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
					</Tooltip>
				</li>
			) }
		</>
	);
};

export default PromotePost;
