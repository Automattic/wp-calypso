import WordPressLogo from 'calypso/components/wordpress-logo';
import type { ReactElement } from 'react';

const CoursesHeader = (): ReactElement => (
	<div className="courses__header">
		<WordPressLogo size={ 24 } className="courses__header-logo" />
	</div>
);

export default CoursesHeader;
