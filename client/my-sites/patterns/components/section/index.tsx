import classNames from 'classnames';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

type PatternsSectionProps = {
	title: string;
	description: string;
	theme?: 'dark';
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
			className={ classNames( 'patterns-section', {
				'patterns-section--dark': theme === 'dark',
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
