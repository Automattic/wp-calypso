import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { pageDot, pageDotFaded } from '../icons';

export interface PageDotsProps {
	/** How many pages there are. */
	count: number;
	/** The zero-based index of the page that shows. */
	current: number;
	/** Called with the zero-based index of the dot that was clicked. */
	onChange: ( index: number ) => void;
	/** Names the group for screen readers, e.g. "Tour sections". */
	label: string;
	/** Names one dot for screen readers. Defaults to "Page 3 of 11". */
	getDotLabel?: ( index: number, count: number ) => string;
}

function defaultDotLabel( index: number, count: number ) {
	return sprintf(
		/* translators: 1: the page number, 2: the number of pages. */
		__( 'Page %1$d of %2$d' ),
		index + 1,
		count
	);
}

/**
 * A row of dots that shows which page of a short sequence is on screen, and jumps to a
 * page when its dot is clicked. The parent owns the current page, so the dots stay in
 * step with any other way of moving through the pages.
 */
export default function PageDots( {
	count,
	current,
	onChange,
	label,
	getDotLabel = defaultDotLabel,
}: PageDotsProps ) {
	return (
		<HStack spacing={ 0 } justify="center" wrap role="group" aria-label={ label }>
			{ Array.from( { length: count }, ( _, index ) => (
				// The dot takes the button's text colour: the theme colour for the current page.
				<Button
					key={ index }
					size="small"
					variant={ index === current ? 'tertiary' : undefined }
					icon={ index === current ? pageDot : pageDotFaded }
					label={ getDotLabel( index, count ) }
					aria-current={ index === current ? 'step' : undefined }
					onClick={ () => onChange( index ) }
				/>
			) ) }
		</HStack>
	);
}
