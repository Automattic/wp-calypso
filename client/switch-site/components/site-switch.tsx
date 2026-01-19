import styled from '@emotion/styled';
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

const FillDefaultIconWhite = styled.div( {
	flexShrink: 0,
} );

const SiteIcon = styled.img( {
	width: '32px',
	verticalAlign: 'middle',
} );

const EmptySiteIcon = styled.div( {
	width: '32px',
	height: '32px',
	background: 'var(--color-neutral-10)',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
} );

const Empty = styled.div( {
	fontSize: '13px',
	textAlign: 'center',
} );

const BackButton = styled.button( {
	cursor: 'pointer',
} );

const LabelWrapper = styled.div( {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	maxWidth: 'calc(100% - 56px)',
	justifyContent: 'center',
} );

const Label = styled.div( {
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	fontSize: '1em',
	'.switch-site__site': {
		color: 'var(--studio-gray-100)',
	},
	'.switch-site__list [aria-selected=true] &': {
		color: 'var(--studio-white)',
	},
	'.switch-site__site mark': {
		fontWeight: 700,
	},
} );

const SubLabel = styled( Label )( {
	color: 'var(--studio-gray-60)',
	opacity: 0.7,
	fontSize: '0.9em',
} );

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
				<BackButton
					type="button"
					onClick={ () => {
						window.history.back();
					} }
					aria-label={ __( 'Go back to the previous screen' ) }
				>
					<Icon icon={ backIcon } />
				</BackButton>
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
							key={ site.name }
							className="switch-site__site"
							role="option"
							aria-selected={ index === selectedIndex }
							tabIndex={ 0 }
							onClick={ () => handleSiteSelect( site ) }
							onKeyDown={ ( e ) => {
								if ( e.key === 'Enter' || e.key === ' ' ) {
									e.preventDefault();
									handleSiteSelect( site );
								}
							} }
						>
							<HStack alignment="left" className="commands-command-menu__item">
								<FillDefaultIconWhite>
									{ site.icon?.img ? (
										<SiteIcon src={ site.icon.img } alt="" />
									) : (
										<EmptySiteIcon>
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
										</EmptySiteIcon>
									) }
								</FillDefaultIconWhite>
								<LabelWrapper>
									<Label>
										<TextHighlight text={ site.name || site.URL } highlight={ search } />
									</Label>

									<SubLabel>
										<TextHighlight text={ site.URL } highlight={ search } />
									</SubLabel>
								</LabelWrapper>
							</HStack>
						</div>
					) )
				) : (
					<Empty>{ __( 'No results found.' ) }</Empty>
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
