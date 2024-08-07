import { Icon, chevronLeft, chevronRight } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { RefObject, useEffect, useRef, useState, ReactNode } from 'react';
import { PatternsSection } from 'calypso/my-sites/patterns/components/section';
import { ReadymadeTemplate, ReadymadeTemplatesProps } from 'calypso/my-sites/patterns/types';
import './style.scss';

type ReadymadeTemplatesSectionProps = ReadymadeTemplatesProps & {
	renderPreview?: ( readymadeTemplate: ReadymadeTemplate ) => ReactNode;
	forwardRef: RefObject< HTMLDivElement > | null;
};

export const ReadymadeTemplatesSection = ( {
	readymadeTemplates,
	forwardRef,
	renderPreview,
}: ReadymadeTemplatesSectionProps ) => {
	const translate = useTranslate();
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

	const props = forwardRef ? { forwardRef } : {};

	return (
		<PatternsSection
			{ ...props }
			bodyFullWidth
			description={ translate(
				'Explore our beautiful, customizable site layouts, designed for quick setup and tailored to fit your needs.'
			) }
			id="readymade-templates-section"
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
							{ renderPreview?.( readymadeTemplate ) }
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
