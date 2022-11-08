import { Button } from '@automattic/components';
import React from 'react';

interface Props {
	description: string;
	actionText: string;
	isCourseComplete?: boolean;
	onComplete: () => void;
}

const CoursesFooter: React.FC< Props > = ( {
	isCourseComplete,
	description,
	actionText,
	onComplete,
} ) => {
	if ( ! isCourseComplete ) {
		return null;
	}

	return (
		<div className="courses__footer">
			<div className="courses__footer-content">
				{ description }
				<Button className="courses__footer-button" onClick={ onComplete }>
					{ actionText }
				</Button>
			</div>
		</div>
	);
};

export default CoursesFooter;
