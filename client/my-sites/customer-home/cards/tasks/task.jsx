/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect, useDispatch } from 'react-redux';
import { Button } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Badge from 'components/badge';
import Gridicon from 'components/gridicon';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';
import Spinner from 'components/spinner';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'state/analytics/actions';
import { skipCurrentViewHomeLayout } from 'state/home/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const Task = ( {
	actionOnClick,
	actionTarget,
	actionText,
	actionUrl,
	badgeText,
	completeOnStart = false,
	description,
	illustration,
	enableSkipOptions = true,
	siteId,
	taskId,
	timing,
	title,
	actionButton,
} ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ areSkipOptionsVisible, setSkipOptionsVisible ] = useState( false );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const skipButtonRef = useRef( null );

	const startTask = () => {
		if ( actionOnClick instanceof Function ) {
			actionOnClick();
		}

		if ( completeOnStart ) {
			setIsLoading( true );
			dispatch( skipCurrentViewHomeLayout( siteId ) );
		}

		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_customer_home_task_start', {
					task: taskId,
				} ),
				bumpStat( 'calypso_customer_home', 'task_start' )
			)
		);
	};

	const skipTask = ( reminder = null ) => {
		setIsLoading( true );
		setSkipOptionsVisible( false );

		dispatch(
			withAnalytics(
				composeAnalytics(
					recordTracksEvent( 'calypso_customer_home_task_skip', {
						task: taskId,
						reminder,
					} ),
					bumpStat( 'calypso_customer_home', 'task_skip' )
				),
				skipCurrentViewHomeLayout( siteId, reminder )
			)
		);
	};

	const ActionButtonWithStats = ( { children } ) => {
		return (
			<div onClick={ startTask } role="presentation">
				{ children }
			</div>
		);
	};

	return (
		<div className={ classnames( 'task', { 'is-loading': isLoading } ) }>
			{ isLoading && <Spinner /> }
			<div className="task__text">
				{ timing && (
					<div className="task__timing">
						<Gridicon icon="time" size={ 18 } />
						{ translate( '%d minute', '%d minutes', { count: timing, args: [ timing ] } ) }
					</div>
				) }
				{ badgeText && (
					<Badge type="info" className="task__badge">
						{ badgeText }
					</Badge>
				) }
				<h2 className="task__title">{ title }</h2>
				<p className="task__description">{ description }</p>
				<div className="task__actions">
					{ actionButton ? (
						<ActionButtonWithStats>{ actionButton }</ActionButtonWithStats>
					) : (
						<Button
							className="task__action"
							primary
							onClick={ startTask }
							href={ actionUrl }
							target={ actionTarget }
						>
							{ actionText }
						</Button>
					) }
					<Button
						className="task__skip is-link"
						ref={ skipButtonRef }
						onClick={ () => ( enableSkipOptions ? setSkipOptionsVisible( true ) : skipTask() ) }
					>
						{ enableSkipOptions ? translate( 'Remind me' ) : translate( 'Dismiss' ) }
						{ enableSkipOptions && <Gridicon icon="dropdown" size={ 18 } /> }
					</Button>
					{ enableSkipOptions && areSkipOptionsVisible && (
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
							<PopoverMenuItem onClick={ () => skipTask() }>
								{ translate( 'Never' ) }
							</PopoverMenuItem>
						</PopoverMenu>
					) }
				</div>
			</div>
			{ isDesktop() && (
				<div className="task__illustration">
					<img src={ illustration } alt="" />
				</div>
			) }
		</div>
	);
};

const mapStateToProps = ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} );

export default connect( mapStateToProps )( Task );
