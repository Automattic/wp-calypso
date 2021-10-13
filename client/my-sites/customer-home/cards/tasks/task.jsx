import { Button, Gridicon } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { useInstanceId } from '@wordpress/compose';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import Badge from 'calypso/components/badge';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import Spinner from 'calypso/components/spinner';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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
	showSkip = true,
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
	const { skipCard } = useSkipCurrentViewMutation( siteId );
	const instanceId = useInstanceId( Task );

	useEffect( () => setIsLoading( forceIsLoading ), [ forceIsLoading ] );

	const startTask = () => {
		if ( actionOnClick instanceof Function ) {
			actionOnClick();
		}

		if ( completeOnStart ) {
			setIsLoading( true );
			skipCard( taskId );
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

		skipCard( taskId, reminder );

		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_customer_home_task_skip', {
					task: taskId,
					reminder,
				} ),
				bumpStat( 'calypso_customer_home', 'task_skip' )
			)
		);
	};

	const ActionButtonWithStats = ( { children } ) => {
		return (
			<div onClick={ startTask } role="presentation" className="task__action">
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
					{ showSkip && (
						<Button
							className="task__skip is-link"
							ref={ skipButtonRef }
							onClick={ () => ( enableSkipOptions ? setSkipOptionsVisible( true ) : skipTask() ) }
							aria-haspopup
							// The WAI recommendation is to not present the aria-expanded attribute when the menu is hidden.
							// See: https://www.w3.org/TR/wai-aria-practices/#wai-aria-roles-states-and-properties-14
							aria-expanded={ enableSkipOptions && areSkipOptionsVisible ? true : undefined }
							aria-controls={ `popover-menu-${ instanceId }` }
						>
							{ enableSkipOptions ? translate( 'Hide this' ) : translate( 'Dismiss' ) }
							{ enableSkipOptions && <Gridicon icon="dropdown" size={ 18 } /> }
						</Button>
					) }
					{ showSkip && enableSkipOptions && areSkipOptionsVisible && (
						<PopoverMenu
							id={ `popover-menu-${ instanceId }` }
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

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
	};
};

export default connect( mapStateToProps )( Task );
