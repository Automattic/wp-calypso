/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import Card from 'components/card';

class Course extends Component {
	render() {
		return (
			<Card className="help-courses__course">
				Latest course: Only visible for users with the business plan
			</Card>
		);
	}
}

export const CoursePlaceholder = () => {
	return (
		<Card className="help-courses__course is-placeholder"></Card>
	);
};

export default localize( Course );
