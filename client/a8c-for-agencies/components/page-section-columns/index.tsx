import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

type SectionBackground = {
	image?: string;
	color?: string;
	isDarkBackground?: boolean;
};

interface ColumnProps {
	heading?: ReactNode;
	children?: ReactNode;
	alignCenter?: boolean;
}

const Column = ( { heading, children, alignCenter }: ColumnProps ) => (
	<div className={ clsx( 'page-section-column', { 'is-align-center': alignCenter } ) }>
		{ heading && <div className="page-section-columns__heading">{ heading }</div> }
		<div className="page-section-column__content">{ children }</div>
	</div>
);

interface PageSectionColumnsProps {
	heading?: ReactNode;
	children: ReactNode;
	background?: SectionBackground;
}

const PageSectionColumns = ( { heading, children, background }: PageSectionColumnsProps ) => {
	const isNarrowView = useBreakpoint( '<960px' );

	const backgroundImageUrl =
		! isNarrowView && background?.image ? `url(${ background.image })` : undefined;

	return (
		<div
			className={ clsx( 'page-section-columns', {
				'is-dark-background': background?.isDarkBackground,
			} ) }
			style={ {
				backgroundColor: background?.color,
				backgroundImage: backgroundImageUrl,
				backgroundSize: 'auto 100%',
			} }
		>
			{ heading && <div className="page-section-columns__heading">{ heading }</div> }
			<div className="page-section-columns__content">{ children }</div>
		</div>
	);
};

PageSectionColumns.Column = Column;

export default PageSectionColumns;
