/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect, useDispatch } from 'react-redux';
import { Button } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';

/**
 * Internal dependencies
 */
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelCta from 'components/action-panel/cta';
import Gridicon from 'components/gridicon';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { removeNotice, successNotice } from 'state/notices/actions';
import { savePreference } from 'state/preferences/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const Task = ( {
	actionText,
	actionUrl,
	description,
	illustration,
	siteId,
	taskId,
	timing,
	title,
} ) => {
	const [ isTaskVisible, setIsTaskVisible ] = useState( true );
	const [ areSkipOptionsVisible, setSkipOptionsVisible ] = useState( false );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const skipButtonRef = useRef( null );

	if ( ! isTaskVisible ) {
		return null;
	}

	const dismissalPreferenceKey = `dismissible-card-home-task-${ taskId }-${ siteId }`;
	const successNoticeId = `task_remind_later_success-${ taskId }`;

	const restoreTask = () => {
		setIsTaskVisible( true );

		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_customer_home_task_restore', {
						task: taskId,
					} ),
					bumpStat( 'calypso_customer_home', 'task_restore' )
				),
				savePreference( dismissalPreferenceKey, false )
			)
		);

		dispatch( removeNotice( successNoticeId ) );
	};

	const skipTask = ( reminder ) => {
		setIsTaskVisible( false );

		const timestamp = Math.floor( Date.now() / 1000 );
		const preference = reminder === 'never' || { dismissed: timestamp, reminder };
		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_customer_home_task_skip', {
						task: taskId,
					} ),
					bumpStat( 'calypso_customer_home', 'task_skip' )
				),
				savePreference( dismissalPreferenceKey, preference )
			)
		);

		dispatch(
			successNotice( translate( 'Task dismissed.' ), {
				id: successNoticeId,
				duration: 5000,
				button: translate( 'Undo' ),
				onClick: restoreTask,
			} )
		);
	};

	return (
		<ActionPanel className="task">
			<ActionPanelBody>
				{ isDesktop() && (
					<ActionPanelFigure align="right">
						<img src={ illustration } alt="" />
					</ActionPanelFigure>
				) }
				<div className="task__timing">
					<Gridicon icon="time" size={ 18 } />
					<p>{ translate( '%d minute', '%d minutes', { count: timing, args: [ timing ] } ) }</p>
				</div>
				<ActionPanelTitle>{ title }</ActionPanelTitle>
				<p className="task__description">{ description }</p>
				<ActionPanelCta>
					<Button className="task__action" primary href={ actionUrl }>
						{ actionText }
					</Button>
					<Button
						className="task__skip is-link"
						ref={ skipButtonRef }
						onClick={ () => {
							setSkipOptionsVisible( true );
						} }
					>
						{ translate( 'Remind me' ) }
						<Gridicon icon="dropdown" size={ 18 } />
					</Button>
					{ areSkipOptionsVisible && (
						<PopoverMenu
							context={ skipButtonRef.current }
							isVisible={ areSkipOptionsVisible }
							onClose={ () => setSkipOptionsVisible( false ) }
							position="bottom"
							className="task__skip-popover"
						>
							<PopoverMenuItem onClick={ () => skipTask( '1d' ) }>
								{ translate( 'Tomorrow' ) }
							</PopoverMenuItem>
							<PopoverMenuItem onClick={ () => skipTask( '1w' ) }>
								{ translate( 'Next week' ) }
							</PopoverMenuItem>
							<PopoverMenuItem onClick={ () => skipTask( 'never' ) }>
								{ translate( 'Never' ) }
							</PopoverMenuItem>
						</PopoverMenu>
					) }
				</ActionPanelCta>
			</ActionPanelBody>
		</ActionPanel>
	);
};

const mapStateToProps = ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} );

export default connect( mapStateToProps )( Task );
