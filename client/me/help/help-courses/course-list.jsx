import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import Course from './course';

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
