import { paginatedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SiteScreenshot from './site-screenshot';
import { normalizeAmplifyUrl } from './url';
import type { CSSProperties } from 'react';

export type SiteOption = { label: string; url: string; hostname: string };

export function getStartErrorMessage( error: unknown ): string {
	const code = ( error as { code?: string } )?.code;
	if ( code === 'site_unreachable' ) {
		return __( 'We couldn’t reach that site. Check that it’s public and try again.' );
	}
	if ( code === 'amplify_report_rate_limited' ) {
		return __( 'You’ve reached the current scan limit. Please try again later.' );
	}
	return __( 'Could not start the analysis. Please try again.' );
}

function WebsiteAddressInput( {
	value,
	onChange,
	onClear,
	label = __( 'Website address' ),
	placeholder = __( 'Paste a public URL' ),
	onFocus,
	onKeyDown,
	combobox,
	invalid,
}: {
	value: string;
	onChange: ( value: string ) => void;
	onClear: () => void;
	label?: string;
	placeholder?: string;
	onFocus?: () => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	combobox?: { expanded: boolean; activeId?: string; listId: string };
	invalid?: boolean;
} ) {
	return (
		<div className="dashboard-amplify-scan-form__url-input">
			<TextControl
				__next40pxDefaultSize
				__nextHasNoMarginBottom
				label={ label }
				value={ value }
				onChange={ onChange }
				placeholder={ placeholder }
				inputMode="url"
				autoComplete="off"
				autoCorrect="off"
				autoCapitalize="none"
				spellCheck={ false }
				onFocus={ onFocus }
				onKeyDown={ onKeyDown }
				role={ combobox ? 'combobox' : undefined }
				aria-autocomplete={ combobox ? 'list' : undefined }
				aria-expanded={ combobox?.expanded }
				aria-controls={ combobox?.expanded ? combobox.listId : undefined }
				aria-activedescendant={ combobox?.activeId }
				aria-invalid={ invalid }
			/>
			{ value && (
				<Button
					type="button"
					variant="tertiary"
					icon={ closeSmall }
					label={ __( 'Clear website address' ) }
					onClick={ onClear }
				/>
			) }
		</div>
	);
}

export function WebsiteAddressPicker( {
	agencyId,
	value,
	selectedSite,
	onChange,
	onClear,
	onSelectSite,
	label = __( 'Website' ),
	placeholder = __( 'Enter a URL or site name' ),
	idPrefix = 'amplify-connected-site',
	invalid,
	portalSuggestions = false,
}: {
	agencyId: number;
	value: string;
	selectedSite: string | null;
	onChange: ( value: string ) => void;
	onClear: () => void;
	onSelectSite: ( site: SiteOption ) => void;
	label?: string;
	placeholder?: string;
	idPrefix?: string;
	invalid?: boolean;
	portalSuggestions?: boolean;
} ) {
	const listId = `${ idPrefix }-list`;
	const [ isOpen, setIsOpen ] = useState( false );
	const [ activeIndex, setActiveIndex ] = useState( -1 );
	const pickerRef = useRef< HTMLDivElement >( null );
	const listRef = useRef< HTMLDivElement >( null );
	const [ portalStyle, setPortalStyle ] = useState< CSSProperties >( {} );
	const firstSites = useQuery( {
		...paginatedAgencySitesQuery( { page: 1, per_page: 20 }, agencyId ),
		enabled: !! agencyId,
	} );
	const totalSites = firstSites.data?.total ?? 0;
	const allSites = useQuery( {
		...paginatedAgencySitesQuery( { page: 1, per_page: totalSites || 20 }, agencyId ),
		enabled: !! agencyId && totalSites > 20 && ! firstSites.isFetching,
	} );
	const sites = allSites.data?.sites ?? firstSites.data?.sites;
	const siteOptions = useMemo(
		() =>
			( sites ?? [] ).flatMap( ( site ) => {
				const url = normalizeAmplifyUrl( site.url_with_scheme ?? site.url );
				if ( ! url ) {
					return [];
				}
				const hostname = new URL( url ).hostname;
				return [ { label: site.blogname || hostname, url, hostname } ];
			} ),
		[ sites ]
	);
	const suggestions = useMemo(
		() =>
			siteOptions
				.filter( ( site ) => {
					const search = value.trim().toLowerCase();
					return (
						! search ||
						site.label.toLowerCase().includes( search ) ||
						site.hostname.toLowerCase().includes( search ) ||
						site.url.toLowerCase().includes( search )
					);
				} )
				.slice( 0, 6 ),
		[ siteOptions, value ]
	);
	const showSuggestions =
		isOpen && ! selectedSite && ( suggestions.length > 0 || ! normalizeAmplifyUrl( value ) );
	useLayoutEffect( () => {
		if ( ! portalSuggestions || ! showSuggestions ) {
			return;
		}
		const updatePosition = () => {
			const rect = pickerRef.current?.getBoundingClientRect();
			if ( ! rect ) {
				return;
			}
			const below = window.innerHeight - rect.bottom - 16;
			const above = rect.top - 16;
			const placeAbove = below < 304 && above > below;
			const maxHeight = Math.max( 80, Math.min( 304, placeAbove ? above : below ) );
			setPortalStyle( {
				left: rect.left,
				top: placeAbove ? rect.top - maxHeight - 8 : rect.bottom + 8,
				width: rect.width,
				maxHeight,
			} );
		};
		updatePosition();
		window.addEventListener( 'resize', updatePosition );
		window.addEventListener( 'scroll', updatePosition, true );
		return () => {
			window.removeEventListener( 'resize', updatePosition );
			window.removeEventListener( 'scroll', updatePosition, true );
		};
	}, [ portalSuggestions, showSuggestions ] );
	const chooseSite = ( site: SiteOption ) => {
		onSelectSite( site );
		setIsOpen( false );
		setActiveIndex( -1 );
	};
	const handleKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		if ( event.key === 'Escape' && isOpen ) {
			event.preventDefault();
			setIsOpen( false );
			setActiveIndex( -1 );
		} else if ( suggestions.length && ( event.key === 'ArrowDown' || event.key === 'ArrowUp' ) ) {
			event.preventDefault();
			setIsOpen( true );
			setActiveIndex( ( current ) => {
				if ( event.key === 'ArrowDown' ) {
					return ( current + 1 ) % suggestions.length;
				}
				if ( current < 0 ) {
					return suggestions.length - 1;
				}
				return ( current - 1 + suggestions.length ) % suggestions.length;
			} );
		} else if ( event.key === 'Enter' && showSuggestions && activeIndex >= 0 ) {
			event.preventDefault();
			chooseSite( suggestions[ activeIndex ] );
		}
	};
	let suggestionContent: React.ReactNode;
	if ( firstSites.isLoading ) {
		suggestionContent = <p>{ __( 'Loading connected sites…' ) }</p>;
	} else if ( firstSites.isError || allSites.isError ) {
		suggestionContent = (
			<p>{ __( 'Connected sites are unavailable. You can still enter a public URL.' ) }</p>
		);
	} else if ( suggestions.length ) {
		suggestionContent = suggestions.map( ( site, index ) => (
			<button
				type="button"
				id={ `${ idPrefix }-${ index }` }
				key={ site.url }
				role="option"
				aria-selected={ activeIndex === index }
				className="dashboard-amplify-scan-form__suggestion"
				data-active={ activeIndex === index }
				onMouseEnter={ () => setActiveIndex( index ) }
				onClick={ () => chooseSite( site ) }
			>
				<span className="dashboard-amplify-scan-form__suggestion-thumbnail">
					<SiteScreenshot url={ site.url } alt="" compact decorative />
				</span>
				<span className="dashboard-amplify-scan-form__suggestion-details">
					<strong>{ site.label }</strong>
					<span className="dashboard-amplify-url">{ site.hostname }</span>
				</span>
			</button>
		) );
	} else {
		suggestionContent = (
			<p>{ __( 'No matching connected sites. You can continue with a public URL.' ) }</p>
		);
	}

	const suggestionList = showSuggestions && (
		<div
			ref={ listRef }
			className={ `dashboard-amplify-scan-form__suggestions${ portalSuggestions ? ' is-portaled' : '' }` }
			id={ listId }
			role="listbox"
			tabIndex={ -1 }
			aria-label={ __( 'Connected sites' ) }
			style={ portalSuggestions ? portalStyle : undefined }
			onMouseDown={ portalSuggestions ? ( event ) => event.preventDefault() : undefined }
		>
			{ suggestionContent }
		</div>
	);

	return (
		<div
			ref={ pickerRef }
			className="dashboard-amplify-scan-form__address-picker"
			onBlur={ ( event ) => {
				if (
					! event.currentTarget.contains( event.relatedTarget ) &&
					! listRef.current?.contains( event.relatedTarget as Node | null )
				) {
					setIsOpen( false );
					setActiveIndex( -1 );
				}
			} }
		>
			<WebsiteAddressInput
				value={ value }
				onChange={ ( next ) => {
					onChange( next );
					setIsOpen( true );
					setActiveIndex( -1 );
				} }
				onClear={ () => {
					onClear();
					setIsOpen( true );
				} }
				onFocus={ () => setIsOpen( true ) }
				onKeyDown={ handleKeyDown }
				label={ label }
				placeholder={ placeholder }
				invalid={ invalid }
				combobox={ {
					expanded: showSuggestions,
					listId,
					activeId:
						showSuggestions && activeIndex >= 0 ? `${ idPrefix }-${ activeIndex }` : undefined,
				} }
			/>
			{ portalSuggestions && suggestionList
				? createPortal( suggestionList, document.body )
				: suggestionList }
		</div>
	);
}
