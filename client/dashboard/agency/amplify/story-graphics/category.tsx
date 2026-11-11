import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { severityFor } from '../score-severity';

import './category.scss';

const SAMPLE_CATEGORY = { score: 8.5, max: 17 };

// “8.5/17” in Knockout, the report's numeral face, traced to outlines so the font isn't shipped.
const SAMPLE_CATEGORY_SCORE_PATH =
	'M266 547V415C266 375 251 346 225 331C251 315 266 286 266 247V119C266 44 219 -10 146 -10C74 -10 26 44 26 119V247C26 286 41 315 67 331C41 346 26 375 26 415V547C26 623 74 676 146 676C219 676 266 623 266 547ZM172 271C172 286 161 297 146 297C131 297 120 286 120 271V117C120 101 131 90 146 90C161 90 172 101 172 117ZM172 549C172 565 161 576 146 576C131 576 120 565 120 549V390C120 374 131 364 146 364C161 364 172 374 172 390Z M391 666V549H312V666Z M667 0H451L438 332L525 341C525 329 537 318 548 318C559 318 571 329 571 343V549C571 565 561 576 546 576C531 576 520 565 520 546V476H432V550C432 614 471 676 544 676C616 676 665 623 665 547V324C665 272 636 235 592 235C564 235 541 246 525 265L532 97H613C646 97 665 70 667 0Z M901 -63H846L673 730H728Z M1038 666V0H983C983 22 972 42 941 42V666Z M1340 42V0H1104V102H1245C1196 233 1142 450 1127 666H1233C1242 429 1278 242 1340 42Z';

/** A category from the sample report: score, what's working and what to improve. */
export default function CategoryGraphic() {
	const ref = useRef< HTMLDivElement >( null );
	const [ isVisible, setIsVisible ] = useState( false );
	const { score, max } = SAMPLE_CATEGORY;

	useEffect( () => {
		const element = ref.current;
		if ( ! element || typeof IntersectionObserver === 'undefined' ) {
			setIsVisible( true );
			return;
		}
		const observer = new IntersectionObserver(
			( [ entry ] ) => {
				if ( entry.isIntersecting ) {
					setIsVisible( true );
					observer.disconnect();
				}
			},
			{ threshold: 0.4 }
		);
		observer.observe( element );
		return () => observer.disconnect();
	}, [] );

	return (
		<div
			ref={ ref }
			className="dashboard-amplify-story__category-card"
			data-visible={ isVisible }
			aria-hidden="true"
		>
			<div
				className="dashboard-amplify-story__category-card-score"
				data-severity={ severityFor( score, max ) }
			>
				<svg viewBox="0 -12 1348 690" focusable="false">
					<path d={ SAMPLE_CATEGORY_SCORE_PATH } />
				</svg>
				<span>
					<i style={ { width: `${ ( score / max ) * 100 }%` } } />
				</span>
			</div>
			<span className="dashboard-amplify-story__category-card-heading">
				{ __( 'What’s working' ) }
			</span>
			<ol>
				<li>{ __( 'The address and opening days are easy to find in the footer.' ) }</li>
			</ol>
			<span className="dashboard-amplify-story__category-card-heading">
				{ __( 'What to improve' ) }
			</span>
			<ol>
				<li>{ __( 'Visitors scroll past three photos before they can book.' ) }</li>
				<li>{ __( 'The only button says “Learn more”.' ) }</li>
				<li>{ __( 'Nothing says how quickly private-dining enquiries are answered.' ) }</li>
			</ol>
		</div>
	);
}
