import {
	__experimentalHStack as HStack,
	Modal,
	TextControl,
	TextHighlight,
} from '@wordpress/components';
import { chevronLeft as backIcon, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteExcerptsSorted } from 'calypso/data/sites/use-site-excerpts-sorted';
import { navigate } from 'calypso/lib/navigate';
import type { SiteExcerptData } from '@automattic/sites';

import './style.scss';

const Switcher = ( { redirectTo }: { redirectTo: string } ) => {
	const { __ } = useI18n();
	const [ search, setSearch ] = useState( '' );
	const [ selectedIndex, setSelectedIndex ] = useState( 0 );
	const siteExcerpts = useSiteExcerptsSorted();
	const input = useRef< HTMLInputElement >( null );
	const listRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		input.current?.focus();
	}, [] );

	const handleSiteSelect = ( site: SiteExcerptData ) => {
		if ( redirectTo.startsWith( '/wp-admin' ) ) {
			navigate( site.URL + redirectTo );
		} else if ( redirectTo.startsWith( '/' ) && redirectTo.includes( ':site' ) ) {
			navigate( redirectTo.replaceAll( ':site', site.slug ) );
		} else {
			navigate( `/home/${ site.slug }` );
		}
	};

	const filteredSites = siteExcerpts.filter( ( site ) => {
		return `${ site.ID } ${ site.name } ${ site.URL }`
			.toLowerCase()
			.includes( search.toLowerCase() );
	} );

	// Reset selected index when filtered sites change
	useEffect( () => {
		setSelectedIndex( 0 );
	}, [ filteredSites.length ] );

	// Scroll selected item into view
	useEffect( () => {
		if ( listRef.current ) {
			const selectedElement = listRef.current.querySelector(
				'[aria-selected="true"]'
			) as HTMLElement;
			if ( selectedElement ) {
				selectedElement.scrollIntoView( { block: 'nearest', behavior: 'smooth' } );
			}
		}
	}, [ selectedIndex ] );

	const handleKeyDown = ( e: React.KeyboardEvent ) => {
		if ( e.key === 'ArrowDown' ) {
			e.preventDefault();
			setSelectedIndex( ( prev ) => Math.min( prev + 1, filteredSites.length - 1 ) );
		} else if ( e.key === 'ArrowUp' ) {
			e.preventDefault();
			setSelectedIndex( ( prev ) => Math.max( prev - 1, 0 ) );
		} else if ( e.key === 'Enter' && filteredSites[ selectedIndex ] ) {
			e.preventDefault();
			handleSiteSelect( filteredSites[ selectedIndex ] );
		}
	};

	return (
		<Modal
			className="switch-site__modal"
			overlayClassName="switch-site__modal-overlay"
			__experimentalHideHeader
			onRequestClose={ () => {} }
			shouldCloseOnClickOutside={ false }
		>
			<div className="switch-site__header">
				<button
					className="switch-site__back-button"
					onClick={ () => {
						window.history.back();
					} }
					aria-label={ __( 'Go back to the previous screen' ) }
				>
					<Icon icon={ backIcon } />
				</button>

				<TextControl
					ref={ input }
					className="switch-site__search"
					value={ search }
					onChange={ ( value?: string ) => {
						setSearch( value ?? '' );
					} }
					onKeyDown={ handleKeyDown }
					placeholder={ __( 'Select site to switch to' ) }
					__next40pxDefaultSize
				/>
			</div>

			<div className="switch-site__list" ref={ listRef }>
				{ filteredSites.length ? (
					filteredSites.map( ( site, index ) => (
						<div
							key={ site.ID }
							className="switch-site__site"
							role="option"
							aria-selected={ index === selectedIndex }
							tabIndex={ 0 }
							onClick={ () => handleSiteSelect( site ) }
							onMouseEnter={ () => setSelectedIndex( index ) }
							onKeyDown={ ( e ) => {
								if ( e.key === 'Enter' || e.key === ' ' ) {
									e.preventDefault();
									handleSiteSelect( site );
								}
							} }
						>
							<HStack alignment="left">
								{ site.icon?.img ? (
									<img className="switch-site__icon" src={ site.icon.img } alt="" />
								) : (
									<div className="switch-site__icon--empty">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											width="24"
											height="24"
										>
											<rect x="0" fill="none" width="24" height="24" />
											<g>
												<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18l2-2 1-1v-2h-2v-1l-1-1H9v3l2 2v1.931C7.06 19.436 4 16.072 4 12l1 1h2v-2h2l3-3V6h-2L9 5v-.411a7.945 7.945 0 016 0V6l-1 1v2l1 1 3.13-3.13A7.983 7.983 0 0119.736 10H18l-2 2v2l1 1h2l.286.286C18.029 18.061 15.239 20 12 20z" />
											</g>
										</svg>
									</div>
								) }

								<div className="switch-site__label-wrapper">
									<div className="switch-site__label">
										<TextHighlight text={ site.name || site.URL } highlight={ search } />
									</div>

									<div className="switch-site__sublabel">
										<TextHighlight text={ site.URL } highlight={ search } />
									</div>
								</div>
							</HStack>
						</div>
					) )
				) : (
					<div className="switch-site__empty">{ __( 'No results found.' ) }</div>
				) }
			</div>
		</Modal>
	);
};

export function SiteSwitch( { redirectTo }: { redirectTo: string } ) {
	const { __ } = useI18n();

	return (
		<main>
			<DocumentHead title={ __( 'Choose site' ) } />
			<Switcher redirectTo={ redirectTo } />
		</main>
	);
}
