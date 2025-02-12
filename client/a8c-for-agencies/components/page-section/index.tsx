import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { TranslateResult } from 'i18n-calypso';
import { ReactNode } from 'react';
import { SectionBackground } from './backgrounds';

import './style.scss';

export type PageSectionProps = {
	className?: string;
	children: ReactNode;
	heading?: TranslateResult;
	subheading?: TranslateResult;
	icon?: ReactNode;
	description?: TranslateResult;
	background?: SectionBackground;
};

export default function PageSection( {
	className,
	icon,
	heading,
	subheading,
	description,
	children,
	background,
}: PageSectionProps ) {
	const isNarrowView = useBreakpoint( '<960px' );

	return (
		<section
			className={ clsx( 'page-section-wrapper', className ) }
			style={ {
				backgroundColor: background?.color,
				backgroundImage: isNarrowView ? undefined : background?.image,
				backgroundSize: background?.size,
			} }
		>
			<div className="page-section">
				<div className="page-section__sub-header">
					{ icon && <div className="page-section__icon">{ icon }</div> }
					{ subheading && <span className="page-section__sub-header-title">{ subheading }</span> }
				</div>

				{ heading && (
					<div className="page-section__header">
						<h2 className="page-section__header-title">{ heading }</h2>

						{ description && <p className="page-section__header-description">{ description }</p> }
					</div>
				) }

				{ children }
			</div>
		</section>
	);
}
