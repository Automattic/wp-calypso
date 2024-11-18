import { Badge, Button, Gridicon, Spinner } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import { useInstanceId } from '@wordpress/compose';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { isValidElement, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import PopoverMenu from 'calypso/components/popover-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import useSkipCurrentViewMutation from 'calypso/data/home/use-skip-current-view-mutation';
import { useDispatch } from 'calypso/state';
import { bumpStat, composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ReminderDuration } from 'calypso/data/home/use-skip-current-view-mutation';
import type { AppState } from 'calypso/types';
import type { ReactNode } from 'react';

import './style.scss';

const Task = ( {
	actionButton,
	actionBusy = false,
	actionOnClick,
	actionTarget,
	actionText,
	actionUrl,
	secondaryActionButton,
	secondaryActionBusy = false,
	secondaryActionOnClick,
	secondaryActionTarget,
	secondaryActionText,
	secondaryActionUrl,
	badgeText,
	completeOnStart = false,
	description,
	hasAction = true,
	hasSecondaryAction = false,
	illustration,
	illustrationAlwaysShow,
	illustrationHeader,
	illustrationTopActions = false,
	isLoading: forceIsLoading = false,
	isUrgent = false,
	showSkip = true,
	skipText,
	enableSkipOptions = true,
	scary,
	siteId,
	taskId,
	timing,
	title,
	customClass,
}: {
	actionOnClick?: () => void;
	actionBusy?: boolean;
	secondaryActionOnClick?: () => void;
	secondaryActionBusy?: boolean;
	badgeText?: ReactNode;
	completeOnStart?: boolean;
	description: ReactNode;
	illustration?: string;
	illustrationAlwaysShow?: boolean;
	illustrationHeader?: ReactNode;
	illustrationTopActions?: boolean;
	isLoading?: boolean;
	isUrgent?: boolean;
	showSkip?: boolean;
	skipText?: ReactNode;
	enableSkipOptions?: boolean;
	scary?: boolean;
	siteId?: number | null;
	taskId: string;
	timing?: number;
	title: ReactNode;
	customClass?: string;
} & (
	| {
			hasAction?: false;
			actionTarget?: string;
			actionText?: ReactNode;
			actionUrl?: string;
			actionButton?: ReactNode;
	  }
	| {
			hasAction: true;
			actionTarget: string;
			actionText: ReactNode;
			actionUrl: string;
			actionButton?: ReactNode;
	  }
) &
	(
		| {
				hasSecondaryAction?: false;
				secondaryActionTarget?: string;
				secondaryActionText?: ReactNode;
				secondaryActionUrl?: string;
				secondaryActionButton?: ReactNode;
		  }
		| {
				hasSecondaryAction: true;
				secondaryActionTarget: string;
				secondaryActionText: ReactNode;
				secondaryActionUrl: string;
				secondaryActionButton?: ReactNode;
		  }
	) ) => {
	const [ isLoading, setIsLoading ] = useState( forceIsLoading );
	const [ areSkipOptionsVisible, setSkipOptionsVisible ] = useState( false );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const skipButtonRef = useRef( null );
	const { skipCard } = useSkipCurrentViewMutation( siteId ?? 0 );
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

	const startSecondaryTask = () => {
		if ( secondaryActionOnClick instanceof Function ) {
			secondaryActionOnClick();
		}

		if ( completeOnStart ) {
			setIsLoading( true );
			skipCard( taskId );
		}

		dispatch(
			composeAnalytics(
				recordTracksEvent( 'calypso_customer_home_task_start_secondary', {
					task: taskId,
				} ),
				bumpStat( 'calypso_customer_home', 'task_start_secondary' )
			)
		);
	};

	const skipTask = ( reminder: ReminderDuration = null ) => {
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

	const ActionButtonWithStats = ( { children }: { children: ReactNode } ) => {
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
				busy={ actionBusy }
			>
				{ actionText }
			</Button>
		);
	};

	const renderSecondaryAction = () => {
		if ( ! hasSecondaryAction ) {
			return null;
		}

		if ( secondaryActionButton ) {
			return <ActionButtonWithStats>{ secondaryActionButton }</ActionButtonWithStats>;
		}

		return (
			<Button
				className="task__action2"
				scary={ scary }
				onClick={ startSecondaryTask }
				href={ secondaryActionUrl }
				target={ secondaryActionTarget }
				busy={ secondaryActionBusy }
			>
				{ secondaryActionText }
			</Button>
		);
	};

	return (
		<div
			className={ clsx(
				'task',
				{
					'is-loading': isLoading,
					'is-urgent': isUrgent,
				},
				customClass
			) }
		>
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
				{ illustrationTopActions && ( illustrationAlwaysShow || isDesktop() ) && illustration && (
					<div className="task__illustration-top-actions">
						{ illustrationHeader && <> { illustrationHeader } </> }
						<img src={ illustration } alt="" />
					</div>
				) }
				<div className="task__actions">
					{ renderAction() }
					{ renderSecondaryAction() }
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
							{ skipText ||
								( enableSkipOptions ? translate( 'Hide this' ) : translate( 'Dismiss' ) ) }
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
			{ ( illustrationAlwaysShow || isDesktop() ) && illustration && (
				<div className="task__illustration">
					{ illustrationHeader && <> { illustrationHeader } </> }
					{ isValidElement( illustration ) ? illustration : <img src={ illustration } alt="" /> }
				</div>
			) }
		</div>
	);
};

const mapStateToProps = ( state: AppState ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
	};
};

export default connect( mapStateToProps )( Task );
