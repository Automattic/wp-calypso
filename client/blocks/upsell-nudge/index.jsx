/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
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
		/*eventProperties: PropTypes.object, @TODO: We may want to be able to assign eventProperties to Tracks events */
		dismissPreferenceName: PropTypes.string,
		buttonText: PropTypes.string,
		icon: PropTypes.oneOfType( [ PropTypes.string, PropTypes.bool ] ),
		href: PropTypes.string,
		text: PropTypes.string,
		onClick: PropTypes.func,
		isCompact: PropTypes.bool,
		track: PropTypes.func.isRequired,
	};

	onClick = e => {
		const { eventName, eventProperties, track, onClick } = this.props;
		track( 'calypso_upsell_nudge_button_click', { event_name: eventName, ...eventProperties } );
		if ( onClick ) {
			onClick( e );
		}
	};

	render() {
		const {
			className,
			dismissPreferenceName,
			eventName,
			buttonText,
			href,
			icon,
			text,
			isCompact,
		} = this.props;
		const classes = classnames( 'upsell-nudge', className );

		return (
			<Banner
				className={ classes }
				callToAction={ buttonText }
				dismissPreferenceName={ dismissPreferenceName }
				event={ eventName }
				href={ href }
				icon={ icon }
				isCompact={ isCompact }
				onClick={ this.onClick }
				title={ text }
			/>
		);
	}
}

const mapStateToProps = null;
const mapDispatchToProps = { track: recordTracksEvent };

export default connect( mapStateToProps, mapDispatchToProps )( localize( UpsellNudge ) );
