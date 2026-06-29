import { PremiumBadge } from '@automattic/components';
import clsx from 'clsx';
import { preventWidows } from 'calypso/lib/formatting';
import type { ReactNode, Ref } from 'react';

import './style.scss';

type PatternsSectionProps = {
	title: string;
	id?: string;
	forwardRef?: Ref< HTMLDivElement >;
	description: string;
	theme?: 'blue' | 'dark' | 'gray';
	bodyFullWidth?: boolean;
	children: ReactNode;
	isPremium?: boolean;
};

export const PatternsSection = ( {
	title,
	forwardRef,
	id,
	description,
	theme,
	bodyFullWidth,
	children,
	isPremium,
}: PatternsSectionProps ) => {
	const sectionProps = id ? { id } : {};
	return (
		<section
			ref={ forwardRef }
			{ ...sectionProps }
			className={ clsx( 'patterns-section', {
				'patterns-section--blue': theme === 'blue',
				'patterns-section--dark': theme === 'dark',
				'patterns-section--gray': theme === 'gray',
				'patterns-section--full-width-body': bodyFullWidth,
			} ) }
		>
			{ isPremium && (
				<div className="patterns-section__premium-badge">
					<PremiumBadge shouldHideTooltip />
				</div>
			) }
			<div className="patterns-section__header">
				<h2>{ title }</h2>
				<div className="patterns-section__header-description">{ preventWidows( description ) }</div>
			</div>
			<div className="patterns-section__body">{ children }</div>
		</section>
	);
};
