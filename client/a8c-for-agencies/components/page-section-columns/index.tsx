import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { ReactNode } from 'react';

import './style.scss';

type SectionBackground = {
	image?: string;
	color?: string;
	isDarkBackground?: boolean;
	size?: string;
};

interface ColumnProps {
	heading?: ReactNode;
	children?: ReactNode;
	alignCenter?: boolean;
	fullWidth?: boolean;
}

const Column = ( { heading, children, alignCenter, fullWidth }: ColumnProps ) => (
	<div
		className={ clsx( 'page-section-column', {
			'is-align-center': alignCenter,
			'is-full-width': fullWidth,
		} ) }
	>
		{ heading && <div className="page-section-columns__heading">{ heading }</div> }
		<div className="page-section-column__content">{ children }</div>
	</div>
);

interface PageSectionColumnsProps {
	heading?: ReactNode;
	children: ReactNode;
	background?: SectionBackground;
	className?: string;
}

const PageSectionColumns = ( {
	heading,
	children,
	background,
	className,
}: PageSectionColumnsProps ) => {
	const isNarrowView = useBreakpoint( '<960px' );

	const backgroundImageUrl =
		! isNarrowView && background?.image ? `url(${ background.image })` : undefined;

	return (
		<div
			className={ clsx( 'page-section-columns', className, {
				'is-dark-background': background?.isDarkBackground,
			} ) }
			style={ {
				backgroundColor: background?.color,
				backgroundImage: backgroundImageUrl,
				backgroundSize: background?.size || 'auto 100%',
			} }
		>
			{ heading && <div className="page-section-columns__heading">{ heading }</div> }
			<div className="page-section-columns__content">{ children }</div>
		</div>
	);
};

PageSectionColumns.Column = Column;

export default PageSectionColumns;
