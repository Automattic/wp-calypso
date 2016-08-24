/**
 * External dependencies
 */
import React from 'react';
import Button from 'components/button';

/**
 * Internal dependencies
 */
import { localize } from 'i18n-calypso';
import Gridicon from 'components/gridicon';
import Card from 'components/card';

export default localize( ( props ) => {
	const {
		date,
		registrationUrl,
		translate
	} = props;

	return (
		<Card compact className="help-courses__course-schedule-item">
			<p className="help-courses__course-schedule-item-date">
				<Gridicon className="help-courses__course-schedule-item-icon" icon="time" size={ 18 }/>
				{
					translate( '%(date)s at %(time)s', {
						args: {
							date: date.format( 'dddd, MMMM D' ),
							time: date.format( 'LT zz' )
						}
					} )
				}
			</p>
			<div className="help-courses__course-schedule-item-buttons">
				<Button className="help-courses__course-schedule-item-register-button"
					target="_blank"
					href={ registrationUrl }>
					{ translate( 'Register' ) }
				</Button>
			</div>
		</Card>
	);
} );
