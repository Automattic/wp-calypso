/**
 * External dependencies
 */
import { times } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { SVG, Circle } from '@wordpress/primitives';
import { Button } from '@wordpress/components';

/*
 * Copied from the Guide Component: https://github.com/WordPress/gutenberg/blob/4bbfbc13603d28fcc45368c529954164bf8581de/packages/components/src/guide/page-control.js#L3
 * Note that it is styled by .components-guide-* styling that already exists from using the Guide package elsewhere
 * TODO: make this into WP package?
 */
export default function PageControl( { currentPage, numberOfPages, setCurrentPage } ) {
	return (
		<ul
			className="components-guide__page-control"
			aria-label={ __( 'Guide controls', 'full-site-editing' ) }
		>
			{ times( numberOfPages, ( page ) => (
				<li
					key={ page }
					// Set aria-current="step" on the active page, see https://www.w3.org/TR/wai-aria-1.1/#aria-current
					aria-current={ page === currentPage ? 'step' : undefined }
				>
					<Button
						key={ page }
						icon={ <PageControlIcon isSelected={ page === currentPage } /> }
						aria-label={ sprintf(
							/* translators: 1: current page number 2: total number of pages */
							__( 'Page %1$d of %2$d', 'full-site-editing' ),
							page + 1,
							numberOfPages
						) }
						onClick={ () => setCurrentPage( page ) }
					/>
				</li>
			) ) }
		</ul>
	);
}

const PageControlIcon = ( { isSelected } ) => (
	<SVG width="8" height="8" fill="none" xmlns="http://www.w3.org/2000/svg">
		<Circle cx="4" cy="4" r="4" fill={ isSelected ? '#419ECD' : '#E1E3E6' } />
	</SVG>
);
