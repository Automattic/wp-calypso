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
	level = 2,
	isPageHeader = false,
}: SectionHeaderProps ) => {
	const _level = isPageHeader ? 1 : level;
	const HeadingTag = `h${ _level }` as keyof JSX.IntrinsicElements;
	return (
		<VStack
			spacing={ 2 }
			className={ clsx( 'dashboard-section-header', {
				'is-page-header': isPageHeader,
			} ) }
		>
			{ prefix && <div className="dashboard-section-header__prefix">{ prefix }</div> }
			<HStack
				spacing={ 4 }
				justify="flex-start"
				alignment="flex-start"
				className="dashboard-section-header__heading-row"
			>
				{ decoration && (
					<span className="dashboard-section-header__decoration">{ decoration }</span>
				) }
				<HStack spacing={ 3 } justify="space-between" alignment="flex-start">
					<HeadingTag
						className={ `dashboard-section-header__heading is-level-${ _level }` }
						id={ headingId }
					>
						{ title }
					</HeadingTag>
					{ /* The wrapper is always needed for view transitions. */ }
					<HStack
						spacing={ 2 }
						justify="flex-end"
						expanded={ false }
						alignment="flex-start"
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
