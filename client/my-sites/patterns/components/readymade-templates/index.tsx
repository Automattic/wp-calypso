import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { useReadymadeTemplates } from 'calypso/my-sites/patterns/hooks/use-readymade-templates';

import './style.scss';

export const ReadymadeTemplates = () => {
	const translate = useTranslate();
	const { data: readymadeTemplates = [] } = useReadymadeTemplates();
	const containerRef = useRef< HTMLDivElement >( null );
	const [ currentScrollLeft, setCurrentScrollLeft ] = useState( 0 );
	const [ maxScrollLeft, setMaxScrollLeft ] = useState( 0 );

	useEffect( () => {
		if ( ! containerRef.current || ! readymadeTemplates.length ) {
			return;
		}
		const container = containerRef.current;

		const updateCurrentScrollLeft = () => {
			setCurrentScrollLeft( container.scrollLeft );
		};
		const updateMaxScrollLeft = () => {
			setMaxScrollLeft( container.scrollWidth - container.clientWidth - 1 ); // Extra pixel to handle rounding errors.
		};

		updateCurrentScrollLeft();
		updateMaxScrollLeft();

		container.addEventListener( 'scroll', updateCurrentScrollLeft );
		window.addEventListener( 'resize', updateMaxScrollLeft );

		return () => {
			container.removeEventListener( 'scroll', updateCurrentScrollLeft );
			window.removeEventListener( 'resize', updateMaxScrollLeft );
		};
	}, [ readymadeTemplates.length ] );

	const scroll = ( direction: 'left' | 'right' ) => {
		if ( ! containerRef.current ) {
			return;
		}
		const container = containerRef.current;

		const increment = direction === 'right' ? 300 : -300;
		let newScrollLeft = container.scrollLeft + increment;
		if ( newScrollLeft < 0 ) {
			newScrollLeft = 0;
		} else if ( newScrollLeft > maxScrollLeft ) {
			newScrollLeft = maxScrollLeft;
		}
		container.scrollTo( {
			left: newScrollLeft,
			behavior: 'smooth',
		} );
	};

	if ( ! readymadeTemplates.length ) {
		return;
	}

	return (
		<PatternsSection
			bodyFullWidth
			description={ translate(
				'Explore a collection of beautiful site layouts made with our patterns.'
			) }
			theme="dark"
			title={ translate( 'Ready-to-use site layouts' ) }
		>
			<div className="readymade-templates" ref={ containerRef }>
				{ readymadeTemplates.map( ( readymadeTemplate ) => (
					<a
						href={ `/patterns/site-layouts/${ readymadeTemplate.template_id } ` }
						className="readymade-template"
						key={ readymadeTemplate.template_id }
					>
						<div className="readymade-template__content">
							<img src={ readymadeTemplate.screenshot } alt="" />
						</div>
						<div className="readymade-template__title">{ readymadeTemplate.title }</div>
					</a>
				) ) }
			</div>
			{ maxScrollLeft > 0 && (
				<div className="readymade-templates-controls">
					<button onClick={ () => scroll( 'left' ) } disabled={ currentScrollLeft <= 0 }>
						<Icon icon={ chevronLeft } />
					</button>
					<button
						onClick={ () => scroll( 'right' ) }
						disabled={ currentScrollLeft >= maxScrollLeft }
					>
						<Icon icon={ chevronRight } />
					</button>
				</div>
			) }
		</PatternsSection>
	);
};
