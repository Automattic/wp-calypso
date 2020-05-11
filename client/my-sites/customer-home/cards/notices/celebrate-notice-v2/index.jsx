/**
 * External dependencies
 */
import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Button } from '@automattic/components';
import { isDesktop } from '@automattic/viewport';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import ActionPanel from 'components/action-panel';
import ActionPanelTitle from 'components/action-panel/title';
import ActionPanelBody from 'components/action-panel/body';
import ActionPanelFigure from 'components/action-panel/figure';
import ActionPanelCta from 'components/action-panel/cta';
import Spinner from 'components/spinner';
import { requestHomeLayout } from 'state/home/actions';
import { savePreference } from 'state/preferences/actions';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import fireworksIllustration from 'assets/images/illustrations/fireworks.svg';

const CelebrateNotice = ( {
	actionText,
	description,
	noticeId,
	onSkip,
	showSkip = false,
	skipText,
	siteId,
	title,
} ) => {
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isVisible, setIsVisible ] = useState( true );
	const dispatch = useDispatch();

	if ( ! isVisible ) {
		return null;
	}

	const dismissalPreferenceKey = `dismissible-card-home-notice-${ noticeId }-${ siteId }`;

	const showNextTask = () => {
		setIsLoading( true );
		dispatch( savePreference( dismissalPreferenceKey, true ) );
		dispatch( requestHomeLayout( siteId ) );
	};

	const skip = () => {
		setIsVisible( false );
		dispatch( savePreference( dismissalPreferenceKey, true ) );
		onSkip && onSkip();
	};

	return (
		<ActionPanel
			className={ classnames( 'celebrate-notice-v2', 'task', { 'is-loading': isLoading } ) }
		>
			{ isLoading && <Spinner /> }
			<ActionPanelBody>
				{ isDesktop() && (
					<ActionPanelFigure align="right">
						<img src={ fireworksIllustration } alt="" />
					</ActionPanelFigure>
				) }
				<div className="celebrate-notice-v2__text task__text">
					<ActionPanelTitle>{ title }</ActionPanelTitle>
					<p className="celebrate-notice-v2__description task__description">{ description }</p>
					<ActionPanelCta>
						<Button
							className="celebrate-notice-v2__action task__action"
							primary
							onClick={ showNextTask }
						>
							{ actionText }
						</Button>

						{ showSkip && (
							<Button className="celebrate-notice-v2__skip task__skip is-link" onClick={ skip }>
								{ skipText }
							</Button>
						) }
					</ActionPanelCta>
				</div>
			</ActionPanelBody>
		</ActionPanel>
	);
};

const mapStateToProps = ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} );

export default connect( mapStateToProps )( CelebrateNotice );
