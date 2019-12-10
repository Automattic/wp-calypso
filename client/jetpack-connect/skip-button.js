/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Gridicon from 'components/gridicon';
import { recordTracksEvent } from 'state/analytics/actions';

class SkipButton extends PureComponent {
	static propTypes = {
		onClick: PropTypes.func,
		tracksEventName: PropTypes.string,

		// Connected props
		recordTracksEvent: PropTypes.func.isRequired,

		// From localize() HoC
		translate: PropTypes.func.isRequired,
	};

	handleClick = () => {
		const { onClick, tracksEventName } = this.props;

		this.props.recordTracksEvent( 'calypso_jpc_skip_button_click' );

		if ( tracksEventName ) {
			this.props.recordTracksEvent( tracksEventName );
		}

		if ( onClick ) {
			onClick();
		}
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

export default connect( null, {
	recordTracksEvent,
} )( localize( SkipButton ) );
