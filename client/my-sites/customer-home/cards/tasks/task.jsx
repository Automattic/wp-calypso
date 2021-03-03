/**
 * External dependencies
 */
import React, { useEffect, useRef, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect, useDispatch } from 'react-redux';
import { Button } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Badge from 'calypso/components/badge';
import Gridicon from 'calypso/components/gridicon';
import PopoverMenu from 'calypso/components/popover/menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import Spinner from 'calypso/components/spinner';
import {
	bumpStat,
	composeAnalytics,
	recordTracksEvent,
	withAnalytics,
} from 'calypso/state/analytics/actions';
import { skipCurrentViewHomeLayout } from 'calypso/state/home/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const Task = ( {
	actionButton,
	actionOnClick,
	actionTarget,
	actionText,
	actionUrl,
	badgeText,
	completeOnStart = false,
	description,
	hasAction = true,
	illustration,
	isLoading: forceIsLoading = false,
	isUrgent = false,
	enableSkipOptions = true,
	scary,
	siteId,
	taskId,
	timing,
	title,
} ) => {
	const [ isLoading, setIsLoading ] = useState( forceIsLoading );
	const [ areSkipOptionsVisible, setSkipOptionsVisible ] = useState( false );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const skipButtonRef = useRef( null );

	useEffect( () => setIsLoading( forceIsLoading ), [ forceIsLoading ] );

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

	const renderAction = () => {
		if ( ! hasAction ) {
			return null;
		}

		if ( actionButton ) {
			return <ActionButtonWithStats>{ actionButton }</ActionButtonWithStats>;
		}

		return (
			<Button
				className="task__action"
				primary
				scary={ scary }
				onClick={ startTask }
				href={ actionUrl }
				target={ actionTarget }
			>
				{ actionText }
			</Button>
		);
	};

	return (
		<div className={ classnames( 'task', { 'is-loading': isLoading, 'is-urgent': isUrgent } ) }>
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
					{ renderAction() }
					<Button
						className="task__skip is-link"
						ref={ skipButtonRef }
						onClick={ () => ( enableSkipOptions ? setSkipOptionsVisible( true ) : skipTask() ) }
					>
						{ enableSkipOptions ? translate( 'Hide this' ) : translate( 'Dismiss' ) }
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
								{ translate( 'For a day' ) }
							</PopoverMenuItem>
							<PopoverMenuItem onClick={ () => skipTask( '1w' ) }>
								{ translate( 'For a week' ) }
							</PopoverMenuItem>
							<PopoverMenuItem onClick={ () => skipTask() }>
								{ translate( 'Forever' ) }
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
