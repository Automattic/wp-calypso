import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useEffect, useState } from 'react';
import {
	NAME_PULSE_PAGE_SIZE,
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from '../helpers';
import { NamePulseResultRow, NamePulseResultRowSkeleton } from './result-row';

export interface NamePulseResultsSectionProps {
	id: string;
	title: string;
	results: NamePulseDomainResult[];
	/** The visible count resets when this changes (a new search), not when a row's status updates. */
	searchKey: string;
	isLoading?: boolean;
	initialVisible?: number;
	/** Hard cap; also disables "Show more". */
	maxVisible?: number;
	skeletonCount?: number;
	showMoreLabel?: string;
	/** Rows revealed by "Show more", so the caller can check their availability. */
	onReveal?: ( rows: NamePulseDomainResult[] ) => void;
	onUpdate?: ( update: NamePulseDomainUpdate ) => void;
}

export const NamePulseResultsSection = ( {
	id,
	title,
	results,
	searchKey,
	isLoading = false,
	initialVisible = NAME_PULSE_PAGE_SIZE,
	maxVisible,
	skeletonCount = NAME_PULSE_PAGE_SIZE,
	showMoreLabel,
	onReveal,
	onUpdate,
}: NamePulseResultsSectionProps ) => {
	const [ visibleCount, setVisibleCount ] = useState( initialVisible );
	const [ skeletonsTimedOut, setSkeletonsTimedOut ] = useState( false );

	useEffect( () => {
		setVisibleCount( initialVisible );
	}, [ searchKey, initialVisible ] );

	// Skeleton slots give up after a while: a response that never comes must
	// not leave a section pulsing forever. A new search resets the timer.
	useEffect( () => {
		setSkeletonsTimedOut( false );

		if ( ! isLoading ) {
			return;
		}

		const timer = setTimeout( () => setSkeletonsTimedOut( true ), NAME_PULSE_SKELETON_TIMEOUT_MS );

		return () => clearTimeout( timer );
	}, [ isLoading, searchKey ] );

	const limit = maxVisible ? Math.min( visibleCount, maxVisible ) : visibleCount;
	const visible = results.slice( 0, limit );
	const total = maxVisible ? Math.min( results.length, maxVisible ) : results.length;
	const hasMore = ! isLoading && showMoreLabel && visible.length < total;
	const skeletons =
		isLoading && ! skeletonsTimedOut ? Math.max( 0, skeletonCount - visible.length ) : 0;

	if ( visible.length === 0 && skeletons === 0 ) {
		return null;
	}

	return (
		<VStack spacing={ 3 } className="name-pulse-section" data-section={ id }>
			<Text as="h2" size={ 15 } weight={ 500 }>
				{ title }
			</Text>
			<div className="name-pulse-grid" role="list">
				{ visible.map( ( result, index ) => (
					<div role="listitem" key={ result.domain_name }>
						<NamePulseResultRow result={ result } position={ index } onUpdate={ onUpdate } />
					</div>
				) ) }
				{ Array.from( { length: skeletons }, ( _, index ) => (
					<div role="listitem" key={ `skeleton-${ index }` }>
						<NamePulseResultRowSkeleton />
					</div>
				) ) }
			</div>
			{ hasMore && (
				<div className="name-pulse-section__more">
					<Button
						variant="link"
						onClick={ () => {
							const nextCount = visibleCount + NAME_PULSE_PAGE_SIZE;
							onReveal?.( results.slice( visibleCount, nextCount ) );
							setVisibleCount( nextCount );
						} }
					>
						{ showMoreLabel }
					</Button>
				</div>
			) }
		</VStack>
	);
};
