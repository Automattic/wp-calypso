import { Card, CardHeader, __experimentalVStack as VStack } from '@wordpress/components';
import clsx from 'clsx';
import { isValidElement, cloneElement, Children, ReactElement } from 'react';
import { SectionHeader } from '../section-header';
import { SummaryButtonListProps } from './types';
import './style.scss';

/**
 * The SummaryButtonList is a utility component that wraps multiple SummaryButton instances
 * along with an optional section header. It provides consistent layout, spacing, and
 * grouping behavior for presenting a collection of summary actions or options.
 *
 * This component ensures visual coherence and structural alignment when multiple
 * SummaryButton elements are displayed together. It is intended for use in contexts
 * where a list of summarised items or actions needs to be grouped under a shared
 * label or heading.
 */
export function SummaryButtonList( {
	title,
	description,
	density = 'medium',
	children,
}: SummaryButtonListProps ) {
	const isMediumDensity = density === 'medium';
	// Clone children and override their density prop.
	const clonedChildren = Children.map( children, ( child ) => {
		if ( isValidElement( child ) ) {
			return cloneElement( child as ReactElement< { density?: string } >, { density } );
		}
		return child;
	} );
	const header = (
		<SectionHeader level={ isMediumDensity ? 3 : 2 } title={ title } description={ description } />
	);
	const className = clsx( 'dashboard-summary-button-list', `has-density-${ density }` );
	if ( isMediumDensity ) {
		return (
			<Card className={ className }>
				<CardHeader>{ header }</CardHeader>
				<VStack spacing="1px" className="dashboard-summary-button-list__children-container">
					{ clonedChildren }
				</VStack>
			</Card>
		);
	}
	return (
		<VStack className={ className } spacing={ 4 }>
			{ header }
			{ clonedChildren }
		</VStack>
	);
}
