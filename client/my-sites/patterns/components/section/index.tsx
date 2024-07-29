import clsx from 'clsx';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

type PatternsSectionProps = {
	title: string;
	description: string;
	theme?: 'blue' | 'dark' | 'gray';
	bodyFullWidth?: boolean;
	children: React.ReactNode;
};

export const PatternsSection = ( {
	title,
	description,
	theme,
	bodyFullWidth,
	children,
}: PatternsSectionProps ) => {
	return (
		<section
			className={ clsx( 'patterns-section', {
				'patterns-section--blue': theme === 'blue',
				'patterns-section--dark': theme === 'dark',
				'patterns-section--gray': theme === 'gray',
				'patterns-section--full-width-body': bodyFullWidth,
			} ) }
		>
			<div className="patterns-section__header">
				<h2>{ title }</h2>
				<div className="patterns-section__header-description">{ preventWidows( description ) }</div>
			</div>
			<div className="patterns-section__body">{ children }</div>
		</section>
	);
};
