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
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import { navigate } from 'state/ui/actions';

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
	};

	render() {
		const {
			className,
			dismissPreferenceName,
			eventName,
			buttonText,
			href,
			icon,
			navigateAndTrack,
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
				onClick={ navigateAndTrack }
				title={ text }
			/>
		);
	}
}

const mapStateToProps = null;
const mapDispatchToProps = ( dispatch, { href, eventName, eventProperties } ) => {
	return {
		navigateAndTrack: () =>
			dispatch(
				withAnalytics(
					recordTracksEvent( 'calypso_upsell_nudge_click', {
						event_name: eventName,
						...eventProperties,
					} ),
					navigate( href )
				)
			),
	};
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( UpsellNudge ) );
