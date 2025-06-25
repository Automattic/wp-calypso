import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import clsx from 'clsx';
import type { SectionHeaderProps } from './types';

import './style.scss';

/**
 * The SectionHeader component provides a consistently structured introduction
 * to a section of content, combining a title, optional description/decoration,
 * and contextual actions. It is used to add hierarchy and clarity within page
 * content or nested in composite components such as SummaryButtonList, or DataFormFields.
 */
export const SectionHeader = ( {
	title,
	description,
	actions,
	decoration,
	headingId,
	prefix,
	className,
	level = 2,
}: SectionHeaderProps ) => {
	const HeadingTag = `h${ level }` as keyof JSX.IntrinsicElements;
	return (
		<VStack className={ clsx( 'dashboard-section-header', `is-level-${ level }`, className ) }>
			{ prefix && <div className="dashboard-section-header__prefix">{ prefix }</div> }
			<HStack
				justify="flex-start"
				alignment="center"
				className="dashboard-section-header__heading-row"
			>
				{ decoration && (
					<span className="dashboard-section-header__decoration">{ decoration }</span>
				) }
				<HStack justify="space-between" alignment="center">
					<HeadingTag className="dashboard-section-header__heading" id={ headingId }>
						{ title }
					</HeadingTag>
					{ /* The wrapper is always needed for view transitions. */ }
					<HStack
						justify="flex-end"
						expanded={ false }
						alignment="center"
						className="dashboard-section-header__actions"
					>
						{ actions }
					</HStack>
				</HStack>
			</HStack>
			{ description && (
				<Text variant="muted" className="dashboard-section-header__description">
					{ description }
				</Text>
			) }
		</VStack>
	);
};
