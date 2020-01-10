/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';

/**
 * Style dependencies
 */
import './style.scss';

export const UpsellNudge = ( {
	buttonText,
	className,
	compact = false,
	dismissPreferenceName,
	href,
	icon = false,
	onClick,
	onDismiss,
	text,
	tracksImpressionName,
	tracksClickName,
	tracksDismissName,
	tracksImpressionProperties,
	tracksClickProperties,
	tracksDismissProperties,
} ) => {
	const classes = classnames( 'upsell-nudge', className );

	return (
		<Banner
			className={ classes }
			callToAction={ buttonText }
			dismissPreferenceName={ dismissPreferenceName }
			href={ href }
			icon={ icon }
			compact={ compact }
			onClick={ onClick }
			onDismiss={ onDismiss }
			title={ text }
			tracksImpressionName={ tracksImpressionName }
			tracksClickName={ tracksClickName }
			tracksDismissName={ tracksDismissName }
			tracksImpressionProperties={ tracksImpressionProperties }
			tracksClickProperties={ tracksClickProperties }
			tracksDismissProperties={ tracksDismissProperties }
		/>
	);
};

export default UpsellNudge;
