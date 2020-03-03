/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Course from './course';
import { Card } from '@automattic/components';

class CourseList extends Component {
	render() {
		const { courses, isBusinessPlanUser } = this.props;

		return (
			<div className="help-courses__course-list">
				{ courses.map( ( course, key ) => {
					return <Course { ...course } key={ key } isBusinessPlanUser={ isBusinessPlanUser } />;
				} ) }
			</div>
		);
	}
}

export const CourseListPlaceholder = () => {
	return <Card className="help-courses__course-list is-placeholder" />;
};

export default localize( CourseList );
