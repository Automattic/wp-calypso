/**
 * External dependencies
 */

import React from 'react';
import Gridicon from 'components/gridicon';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import SocialLogo from 'components/social-logo';

const renderIcon = ( icon ) =>
	icon && (
		<span className={ `date-picker__icon-wrapper date-picker__icon-wrapper-${ icon }` }>
			<Gridicon icon={ icon } size={ 18 } />
		</span>
	);

const renderSocialIcon = ( icon, color ) => {
	if ( ! icon ) {
		return null;
	}

	const socialIconClasses = classNames(
		'date-picker__social-icon-wrapper',
		`date-picker__social-icon-wrapper-${ icon }`,
		{ 'date-picker__social-icon-wrapper-color': color }
	);

	return (
		<span className={ socialIconClasses }>
			<SocialLogo icon={ icon } size={ 18 } />
		</span>
	);
};

export const CalendarEvent = ( { icon, socialIcon, socialIconColor = true, title } ) => {
	return (
		<div className="date-picker__calendar-event">
			{ renderIcon( icon ) }
			{ renderSocialIcon( socialIcon, socialIconColor ) }

			<span className="date-picker__event-title">{ title }</span>
		</div>
	);
};
