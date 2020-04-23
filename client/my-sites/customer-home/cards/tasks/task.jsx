/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
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
import { savePreference } from 'state/preferences/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const Task = ( {
	title,
	description,
	actionText,
	actionUrl,
	illustration,
	timing,
	skipTask,
} ) => {
	const translate = useTranslate();
	const [ isTaskVisible, setIsTaskVisible ] = useState( true );
	const [ areSkipOptionsVisible, setSkipOptionsVisible ] = useState( false );
	const skipButtonRef = useRef( null );

	if ( ! isTaskVisible ) {
		return null;
	}

	const remindLater = ( reminder ) => {
		setIsTaskVisible( false );
		skipTask( reminder );
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
							<PopoverMenuItem onClick={ () => remindLater( '1d' ) }>
								{ translate( 'Tomorrow' ) }
							</PopoverMenuItem>
							<PopoverMenuItem onClick={ () => remindLater( '1w' ) }>
								{ translate( 'Next week' ) }
							</PopoverMenuItem>
							<PopoverMenuItem onClick={ () => remindLater( 'never' ) }>
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

const mapDispatchToProps = {
	skipTask: ( siteId, dismissalPreferenceName, reminder ) => {
		const timestamp = Math.floor( Date.now() / 1000 );
		const preference = reminder === 'never' || { dismissed: timestamp, reminder };
		return savePreference(
			`dismissible-card-${ dismissalPreferenceName }-${ siteId }`,
			preference
		);
	},
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	return {
		...stateProps,
		skipTask: ( reminder ) =>
			dispatchProps.skipTask( stateProps.siteId, ownProps.dismissalPreferenceName, reminder ),
		...ownProps,
	};
};

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( Task );
