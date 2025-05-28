import { Card, CardHeader, CardBody, __experimentalVStack as VStack } from '@wordpress/components';
import { useInstanceId } from '@wordpress/compose';
import clsx from 'clsx';
import { isValidElement, cloneElement, Children } from 'react';
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
	const titleId = useInstanceId( SummaryButtonList, 'dashboard-summary-button-list__title' );
	const isMediumDensity = density === 'medium';
	// Clone children and override their density prop.
	const clonedChildren = Children.map( children, ( child ) => {
		if ( isValidElement( child ) ) {
			return (
				<li className="dashboard-summary-button-list__children-list-item">
					{ cloneElement( child, { density } ) }
				</li>
			);
		}
		return child;
	} );
	const header = title && (
		<SectionHeader headingId={ titleId } level={ 3 } title={ title } description={ description } />
	);
	const className = clsx( 'dashboard-summary-button-list', `has-density-${ density }` );
	const childrenList = (
		<ul
			className="dashboard-summary-button-list__children-list"
			aria-labelledby={ title ? titleId : undefined }
		>
			{ clonedChildren }
		</ul>
	);
	if ( isMediumDensity ) {
		return (
			<Card className={ className }>
				{ header && <CardHeader>{ header }</CardHeader> }
				<CardBody className="dashboard-summary-button-list__children-list-wrapper">
					{ childrenList }
				</CardBody>
			</Card>
		);
	}
	return (
		<VStack className={ className } spacing={ 6 }>
			{ header }
			{ childrenList }
		</VStack>
	);
}
