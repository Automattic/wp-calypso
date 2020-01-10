/**
 * External dependencies
 */
import React from 'react';
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

export const UpsellNudge = ( {
	buttonText,
	className,
	dismissPreferenceName,
	eventName,
	href,
	icon,
	compact,
	navigateAndTrack,
	text,
} ) => {
	const classes = classnames( 'upsell-nudge', className );

	return (
		<Banner
			className={ classes }
			callToAction={ buttonText }
			dismissPreferenceName={ dismissPreferenceName }
			event={ eventName }
			href={ href }
			icon={ icon }
			compact={ compact }
			onClick={ navigateAndTrack }
			title={ text }
		/>
	);
};

const mapDispatchToProps = (
	dispatch,
	{ tracksEvent = 'calypso_upsell_nudge_click', href, eventName, eventProperties }
) => {
	return {
		navigateAndTrack: () =>
			dispatch(
				withAnalytics(
					recordTracksEvent( tracksEvent, {
						cta_name: eventName,
						...eventProperties,
					} ),
					navigate( href )
				)
			),
	};
};

export default connect( null, mapDispatchToProps )( localize( UpsellNudge ) );
