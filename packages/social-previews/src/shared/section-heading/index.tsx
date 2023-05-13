const HEADING_LEVELS = [ 2, 3, 4, 5, 6 ] as const;

export type SectionHeadingProps = {
	className?: string;
	level?: ( typeof HEADING_LEVELS )[ number ];
	children?: React.ReactNode;
};

export const SectionHeading: React.FC< SectionHeadingProps > = ( {
	className,
	level,
	children,
} ) => {
	const Tag = `h${ level && HEADING_LEVELS.includes( level ) ? level : 3 }` as const;

	return (
		<Tag className={ `social-preview__section-heading ${ className ?? '' }` }>{ children }</Tag>
	);
};

export default SectionHeading;
