/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'gridicons';
import { recordTracksEvent } from 'state/analytics/actions';

class SkipButton extends PureComponent {
	handleClick = () => {
		const { onClick, tracksEventName } = this.props;

		this.props.recordTracksEvent( 'calypso_jpc_skip_button_click' );

		if ( tracksEventName ) {
			this.props.recordTracksEvent( tracksEventName );
		}

		onClick();
	};

	render() {
		const { translate } = this.props;

		return (
			<div className="jetpack-connect__skip-button">
				<Button onClick={ this.handleClick } borderless>
					{ translate( 'Skip' ) }
					<Gridicon icon="arrow-right" size={ 18 } />
				</Button>
			</div>
		);
	}
}

export default connect(
	null,
	{
		recordTracksEvent,
	}
)( localize( SkipButton ) );
