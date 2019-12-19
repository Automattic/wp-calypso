/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

export class UpsellNudge extends Component {
	static defaultProps = {
		className: '',
	};

	static propTypes = {
		className: PropTypes.string,
		eventName: PropTypes.string,
		eventProperties: PropTypes.object,
		buttonText: PropTypes.string,
		icon: PropTypes.string,
		href: PropTypes.string,
		text: PropTypes.string,
		onClick: PropTypes.func,
		onDismissClick: PropTypes.func,
		showDismiss: PropTypes.bool,
		isCompact: PropTypes.bool,
		track: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	onClick = e => {
		const { eventName, eventProperties, track, onClick } = this.props;
		track( 'calypso_upsell_nudge_button_click', { event_name: eventName, ...eventProperties } );
		if ( onClick ) {
			onClick( e );
		}
	};

	onDismissClick = e => {
		const { eventName, eventProperties, track, onDismissClick } = this.props;
		track( 'calypso_upsell_nudge_button_dismiss_click', {
			event_name: eventName,
			...eventProperties,
		} );
		if ( onDismissClick ) {
			onDismissClick( e );
		}
	};

	render() {
		const {
			className,
			eventName,
			eventProperties,
			buttonText,
			href,
			icon,
			text,
			isCompact,
			showDismiss,
			translate,
		} = this.props;
		const classes = classnames( 'upsell-nudge', className, isCompact ? 'compact' : '' );

		return (
			<div className={ classes }>
				<TrackComponentView
					eventName="calypso_upsell_nudge_impression"
					eventProperties={ { event_name: eventName, ...eventProperties } }
				/>
				{ icon && (
					<Gridicon className="upsell-nudge__icon" icon={ icon } size={ isCompact ? 18 : 24 } />
				) }
				<span className="upsell-nudge__content">
					<span className="upsell-nudge__text">
						<a href={ href } onClick={ this.onClick }>
							{ text }
						</a>
					</span>
				</span>
				{ buttonText && (
					<Button
						className="upsell-nudge__button"
						compact={ isCompact }
						primary
						onClick={ this.onClick }
						href={ href }
					>
						{ buttonText }
					</Button>
				) }
				{ showDismiss && (
					<span className="upsell-nudge__dismiss">
						<Button
							className="upsell-nudge__dismiss-button"
							onClick={ this.onDismissClick }
							aria-label={ translate( 'Dismiss' ) }
							compact
							borderless
						>
							<Gridicon
								className="upsell-nudge__dismiss-icon"
								icon={ isCompact ? 'cross-small' : 'cross' }
								size={ 18 }
							/>
						</Button>
					</span>
				) }
			</div>
		);
	}
}

const mapStateToProps = null;
const mapDispatchToProps = { track: recordTracksEvent };

export default connect( mapStateToProps, mapDispatchToProps )( localize( UpsellNudge ) );
