/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { recordTracksEvent } from 'state/analytics/actions';

class GoogleMyBusinessStatsTip extends Component {
	static propTypes = {
		buttonHref: PropTypes.string.isRequired,
		buttonText: PropTypes.string.isRequired,
		eventName: PropTypes.string.isRequired,
		illustration: PropTypes.string.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		text: PropTypes.string.isRequired,
		translate: PropTypes.func.isRequired,
	};

	trackClick = () => {
		this.props.recordTracksEvent( this.props.eventName );
	};

	render() {
		const {
			buttonHref,
			buttonText,
			illustration,
			text,
			translate,
		} = this.props;

		return (
			<Card className="gmb-stats__tip">
				<div className="gmb-stats__tip-main">
					<img
						alt={ translate( 'Illustration' ) }
						className="gmb-stats__tip-illustration"
						src={ `/calypso/images/google-my-business/${ illustration }.svg` }
					/>

					<p>{ text }</p>
				</div>

				<Button
					className="gmb-stats__tip-button"
					primary
					href={ buttonHref }
					onClick={ this.trackClick }
					target="_blank"
				>
					{ buttonText } <Gridicon icon="external" />
				</Button>
			</Card>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
} )( localize( GoogleMyBusinessStatsTip ) );
