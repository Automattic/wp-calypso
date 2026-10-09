import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import {
	NAME_PULSE_PAGE_SIZE,
	NAME_PULSE_SKELETON_TIMEOUT_MS,
	type NamePulseDomainResult,
	type NamePulseTracksSection,
} from '../helpers';
import {
	NamePulseResultRow,
	NamePulseResultRowSkeleton,
	type NamePulseResultRowVariant,
} from './result-row';

interface NamePulseResultsSectionProps {
	id: Exclude< NamePulseTracksSection, 'exact_card' >;
	/** Omitted while the heading text is not known yet (the skeletons still render). */
	title?: string;
	results: NamePulseDomainResult[];
	isLoading?: boolean;
	/** Hard cap; also disables "Show more". */
	maxVisible?: number;
	skeletonCount?: number;
	showMoreLabel?: string;
	/** Rows revealed by "Show more", so the caller can check their availability. */
	onReveal?: ( rows: NamePulseDomainResult[] ) => void;
	/** `card` lays each result out as its own larger card instead of a table row; phones keep the table. */
	variant?: NamePulseResultRowVariant;
}

export const NamePulseResultsSection = ( {
	id,
	title,
	results,
	isLoading = false,
	maxVisible,
	skeletonCount = NAME_PULSE_PAGE_SIZE,
	showMoreLabel,
	onReveal,
	variant = 'row',
}: NamePulseResultsSectionProps ) => {
	const { events } = useDomainSearch();
	const [ visibleCount, setVisibleCount ] = useState( NAME_PULSE_PAGE_SIZE );
	const [ skeletonsTimedOut, setSkeletonsTimedOut ] = useState( false );
	const isPhone = useViewportMatch( 'small', '<' );
	const layout = isPhone ? 'row' : variant;

	// Skeleton slots give up after a while: a response that never comes must
	// not leave a section pulsing forever.
	useEffect( () => {
		setSkeletonsTimedOut( false );

		if ( ! isLoading ) {
			return;
		}

		const timer = setTimeout( () => setSkeletonsTimedOut( true ), NAME_PULSE_SKELETON_TIMEOUT_MS );

		return () => clearTimeout( timer );
	}, [ isLoading ] );

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
			{ title && (
				<Text as="h2" size={ 18 } weight={ 500 }>
					{ title }
				</Text>
			) }
			<div
				className={ clsx( 'name-pulse-grid', layout === 'card' && 'name-pulse-grid--cards' ) }
				role="list"
			>
				{ visible.map( ( result, index ) => (
					<div role="listitem" key={ result.domain_name }>
						<NamePulseResultRow
							result={ result }
							section={ id }
							position={ index }
							variant={ layout }
						/>
					</div>
				) ) }
				{ Array.from( { length: skeletons }, ( _, index ) => (
					<div role="listitem" key={ `skeleton-${ index }` }>
						<NamePulseResultRowSkeleton variant={ layout } />
					</div>
				) ) }
			</div>
			{ hasMore && (
				<div className="name-pulse-section__more">
					<Button
						variant="link"
						onClick={ () => {
							const nextCount = visibleCount + NAME_PULSE_PAGE_SIZE;
							events.onShowMoreResults( nextCount / NAME_PULSE_PAGE_SIZE );
							events.onNamePulseTracksEvent( 'show_more_click', {
								results_section: id,
								visible_before: visible.length,
								visible_after: Math.min( nextCount, total ),
							} );
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
