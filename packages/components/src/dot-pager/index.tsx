import { Icon, arrowRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate, useRtl } from 'i18n-calypso';
import { times } from 'lodash';
import { Children, useState, useEffect, ReactNode } from 'react';
// REPLACE ME WITH WP BUTTON. THIS BUTTON IS BAD (has aggressive styles with generic class names).
import Button from '../button';
import { Swipeable } from '../swipeable';

import './style.scss';

type ControlsProps = {
	showControlLabels?: boolean;
	currentPage: number;
	numberOfPages: number;
	setCurrentPage: ( page: number ) => void;
	navArrowSize: number;
	tracksPrefix: string;
	tracksFn: ( eventName: string, data?: any ) => void;
};

const Controls = ( {
	showControlLabels = false,
	currentPage,
	numberOfPages,
	setCurrentPage,
	navArrowSize,
	tracksPrefix,
	tracksFn,
}: ControlsProps ) => {
	const translate = useTranslate();
	const isRtl = useRtl();
	if ( numberOfPages < 2 ) {
		return null;
	}
	const canGoBack = currentPage > 0;
	const canGoForward = currentPage < numberOfPages - 1;
	return (
		<ul className="dot-pager__controls" aria-label={ translate( 'Pager controls' ) }>
			{ times( numberOfPages, ( page ) => (
				<li key={ `page-${ page }` } aria-current={ page === currentPage ? 'page' : undefined }>
					<button
						key={ page.toString() }
						className={ clsx( 'dot-pager__control-choose-page', {
							'dot-pager__control-current': page === currentPage,
						} ) }
						disabled={ page === currentPage }
						aria-label={
							translate( 'Page %(page)d of %(numberOfPages)d', {
								args: { page: page + 1, numberOfPages },
							} ) as string
						}
						onClick={ () => {
							tracksFn( tracksPrefix + '_dot_click', {
								current_page: currentPage,
								destination_page: page,
							} );
							setCurrentPage( page );
						} }
					/>
				</li>
			) ) }
			<li key="dot-pager-prev" className="dot-pager__control-gap">
				<button
					className="dot-pager__control-prev"
					disabled={ ! canGoBack }
					aria-label={ translate( 'Previous' ) }
					onClick={ () => {
						const destinationPage = currentPage - 1;
						tracksFn( tracksPrefix + '_prev_arrow_click', {
							current_page: currentPage,
							destination_page: destinationPage,
						} );
						setCurrentPage( destinationPage );
					} }
				>
					{ /* The arrowLeft icon isn't as bold as arrowRight, so using the same icon and flipping to make sure they match */ }
					<Icon
						icon={ arrowRight }
						size={ navArrowSize }
						fill="currentColor"
						style={
							/* Flip the icon for languages with LTR direction. */
							! isRtl ? { transform: 'scaleX(-1)' } : undefined
						}
					/>
					{ showControlLabels && translate( 'Previous' ) }
				</button>
			</li>
			<li key="dot-pager-next">
				<button
					className="dot-pager__control-next"
					disabled={ ! canGoForward }
					aria-label={ translate( 'Next' ) }
					onClick={ () => {
						const destinationPage = currentPage + 1;
						tracksFn( tracksPrefix + '_next_arrow_click', {
							current_page: currentPage,
							destination_page: destinationPage,
						} );
						setCurrentPage( destinationPage );
					} }
				>
					{ showControlLabels && translate( 'Next' ) }
					<Icon
						icon={ arrowRight }
						size={ navArrowSize }
						fill="currentColor"
						style={
							/* Flip the icon for languages with RTL direction. */
							isRtl ? { transform: 'scaleX(-1)' } : undefined
						}
					/>
				</button>
			</li>
		</ul>
	);
};

type DotPagerProps = {
	showControlLabels?: boolean;
	hasDynamicHeight?: boolean;
	children: ReactNode;
	className?: string;
	onPageSelected?: ( index: number ) => void;
	isClickEnabled?: boolean;
	rotateTime?: number;
	navArrowSize?: number;
	tracksPrefix?: string;
	tracksFn?: ( eventName: string, data?: Record< string, unknown > ) => void;
	includePreviousButton?: boolean;
	includeNextButton?: boolean;
	includeFinishButton?: boolean;
	onFinish?: () => void;
};

const DotPager = ( {
	showControlLabels = false,
	hasDynamicHeight = false,
	children,
	className = '',
	onPageSelected,
	isClickEnabled = false,
	rotateTime = 0,
	navArrowSize = 18,
	tracksPrefix = '',
	tracksFn = () => {},
	includePreviousButton = false,
	includeNextButton = false,
	includeFinishButton = false,
	onFinish = () => {},
	...props
}: DotPagerProps ) => {
	const translate = useTranslate();

	// Filter out the empty children
	const normalizedChildren = Children.toArray( children ).filter( Boolean );

	const [ currentPage, setCurrentPage ] = useState( 0 );

	const numPages = Children.count( normalizedChildren );

	useEffect( () => {
		if ( currentPage >= numPages ) {
			setCurrentPage( numPages - 1 );
		}
	}, [ numPages, currentPage ] );

	useEffect( () => {
		if ( rotateTime > 0 && numPages > 1 ) {
			const timerId = setTimeout( () => {
				setCurrentPage( ( currentPage + 1 ) % numPages );
			}, rotateTime );

			return () => clearTimeout( timerId );
		}
	}, [ currentPage, numPages, rotateTime ] );

	const handleSelectPage = ( index: number ) => {
		setCurrentPage( index );
		onPageSelected?.( index );
	};

	return (
		<div className={ clsx( 'dot-pager', className ) } { ...props }>
			<Controls
				showControlLabels={ showControlLabels }
				currentPage={ currentPage }
				numberOfPages={ numPages }
				setCurrentPage={ handleSelectPage }
				navArrowSize={ navArrowSize }
				tracksPrefix={ tracksPrefix }
				tracksFn={ tracksFn }
			/>
			<Swipeable
				hasDynamicHeight={ hasDynamicHeight }
				onPageSelect={ handleSelectPage }
				currentPage={ currentPage }
				pageClassName="dot-pager__page"
				containerClassName="dot-pager__pages"
				isClickEnabled={ isClickEnabled }
			>
				{ normalizedChildren }
			</Swipeable>
			{ includePreviousButton && currentPage !== 0 && (
				<Button
					className="dot-pager__button dot-pager__button_previous"
					onClick={ () => {
						const destinationPage = currentPage - 1;
						tracksFn( tracksPrefix + '_prev_button_click', {
							current_page: currentPage,
							destination_page: destinationPage,
						} );
						setCurrentPage( destinationPage );
					} }
				>
					{ translate( 'Previous' ) }
				</Button>
			) }
			{ includeNextButton && currentPage < numPages - 1 && (
				<Button
					className="dot-pager__button dot-pager__button_next is-primary"
					onClick={ () => {
						const destinationPage = currentPage + 1;
						tracksFn( tracksPrefix + '_next_button_click', {
							current_page: currentPage,
							destination_page: destinationPage,
						} );
						setCurrentPage( destinationPage );
					} }
				>
					{ translate( 'Next' ) }
				</Button>
			) }
			{ includeFinishButton && currentPage === numPages - 1 && (
				<Button
					className="dot-pager__button dot-pager__button_finish is-primary"
					onClick={ () => {
						tracksFn( tracksPrefix + '_finish_button_click' );
						onFinish();
					} }
				>
					{ translate( 'Done' ) }
				</Button>
			) }
		</div>
	);
};

export default DotPager;
