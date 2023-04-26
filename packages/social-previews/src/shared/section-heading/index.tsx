import { createElement } from 'react';

type Props = {
	className?: string;
	level?: number;
	children?: React.ReactNode;
};

const HEADING_LEVELS = [ 2, 3, 4, 5, 6 ];

const SectionHeading: React.FC< Props > = ( { className, level, children } ) => {
	return createElement(
		`h${ level && HEADING_LEVELS.indexOf( level ) > -1 ? level : 3 }`,
		{ className: `social-preview__section-heading ${ className ?? '' }` },
		children
	);
};

export default SectionHeading;
