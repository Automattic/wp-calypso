import { paginatedAgencySitesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalInputControl as InputControl,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { closeSmall } from '@wordpress/icons';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Text } from '../../components/text';
import SiteScreenshot from '../components/site-screenshot';
import { normalizeAmplifyUrl } from './url';
import type { CSSProperties } from 'react';

import './scan-form.scss';

export type SiteOption = { label: string; url: string; hostname: string };

type StartError = {
	code?: string;
	data?: { details?: { url?: { code?: string } } };
};

export function getStartErrorMessage( error: unknown ): string {
	const { code, data } = ( error ?? {} ) as StartError;
	// A rejected URL comes back as an invalid parameter, with the reason on the field.
	if ( code === 'rest_invalid_param' && data?.details?.url?.code === 'a4a_amplify_bad_url' ) {
		return __(
			'We can’t audit that address. It needs to be a public http:// or https:// URL on a standard port.'
		);
	}
	if ( code === 'site_unreachable' ) {
		return __( 'We couldn’t reach that site. Check that it’s public and try again.' );
	}
	if ( code === 'amplify_report_limit_reached' ) {
		return __( 'You’ve used all your reports for this month.' );
	}
	if ( code === 'amplify_report_rate_limited' ) {
		return __( 'You’ve started too many reports today. Try again later.' );
	}
	if ( code === 'amplify_account_not_activated' ) {
		return __( 'Reports unlock once your account is activated.' );
	}
	return __( 'Could not start the report. Please try again.' );
}

function WebsiteAddressInput( {
	value,
	onChange,
	onClear,
	label,
	placeholder,
	onFocus,
	onKeyDown,
	combobox,
	invalid,
	describedBy,
}: {
	value: string;
	onChange: ( value: string ) => void;
	onClear: () => void;
	label: string;
	placeholder: string;
	onFocus?: () => void;
	onKeyDown?: ( event: React.KeyboardEvent< HTMLInputElement > ) => void;
	combobox?: { expanded: boolean; activeId?: string; listId: string };
	invalid?: boolean;
	describedBy?: string;
} ) {
	const inputRef = useRef< HTMLInputElement >( null );
	return (
		<div className="dashboard-amplify-scan-form__url-input">
			<InputControl
				ref={ inputRef }
				__next40pxDefaultSize
				label={ label }
				value={ value }
				onChange={ ( next ) => onChange( next ?? '' ) }
				placeholder={ placeholder }
				inputMode="url"
				dir="ltr"
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
				aria-describedby={ describedBy }
				suffix={
					value ? (
						<InputControlSuffixWrapper variant="control">
							<Button
								__next40pxDefaultSize
								size="small"
								icon={ closeSmall }
								label={ __( 'Clear website address' ) }
								onClick={ () => {
									onClear();
									// The button disappears with the text, so keep focus in the field.
									inputRef.current?.focus();
								} }
							/>
						</InputControlSuffixWrapper>
					) : undefined
				}
			/>
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
	label,
	placeholder,
	idPrefix = 'amplify-connected-site',
	invalid,
	describedBy,
	portalSuggestions = false,
}: {
	agencyId: number;
	value: string;
	selectedSite: string | null;
	onChange: ( value: string ) => void;
	onClear: () => void;
	onSelectSite: ( site: SiteOption ) => void;
	label: string;
	placeholder: string;
	idPrefix?: string;
	invalid?: boolean;
	/** The id of the error message, so screen readers read it with the field. */
	describedBy?: string;
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
	// Loading, error and empty messages sit beside the listbox, which only holds options.
	let statusMessage: string | null = null;
	if ( firstSites.isLoading ) {
		statusMessage = __( 'Loading connected sites…' );
	} else if ( firstSites.isError || allSites.isError ) {
		statusMessage = __( 'Connected sites are unavailable. You can still enter a public URL.' );
	} else if ( ! suggestions.length ) {
		statusMessage = __( 'No matching connected sites. You can continue with a public URL.' );
	}
	const showOptions = showSuggestions && ! statusMessage;
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
				...( placeAbove
					? { bottom: window.innerHeight - rect.top + 8 }
					: { top: rect.bottom + 8 } ),
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
		if ( event.key === 'Escape' && showSuggestions ) {
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
		} else if ( event.key === 'Enter' && showOptions && activeIndex >= 0 ) {
			event.preventDefault();
			chooseSite( suggestions[ activeIndex ] );
		}
	};

	const suggestionList = showSuggestions && (
		<div
			ref={ listRef }
			className={ `dashboard-amplify-scan-form__suggestions${ portalSuggestions ? ' is-portaled' : '' }` }
			style={ portalSuggestions ? portalStyle : undefined }
			role="presentation"
			onMouseDown={ portalSuggestions ? ( event ) => event.preventDefault() : undefined }
		>
			{ statusMessage ? (
				<Text
					as="p"
					role="status"
					size={ 13 }
					variant="muted"
					className="dashboard-amplify-scan-form__suggestions-status"
				>
					{ statusMessage }
				</Text>
			) : (
				<div id={ listId } role="listbox" tabIndex={ -1 } aria-label={ __( 'Connected sites' ) }>
					{ suggestions.map( ( site, index ) => (
						// The field keeps focus and moves through the options with aria-activedescendant.
						<div
							id={ `${ idPrefix }-${ index }` }
							key={ site.url }
							role="option"
							tabIndex={ -1 }
							aria-selected={ activeIndex === index }
							className="dashboard-amplify-scan-form__suggestion"
							data-active={ activeIndex === index }
							onMouseEnter={ () => setActiveIndex( index ) }
							// Choosing on mousedown keeps focus in the field, so the list doesn't blur closed first.
							onMouseDown={ ( event ) => {
								event.preventDefault();
								chooseSite( site );
							} }
						>
							<span className="dashboard-amplify-scan-form__suggestion-thumbnail">
								<SiteScreenshot url={ site.url } alt="" compact decorative fill />
							</span>
							<VStack spacing={ 0.5 } className="dashboard-amplify-scan-form__suggestion-details">
								<Text weight={ 600 } truncate>
									{ site.label }
								</Text>
								<Text size={ 12 } variant="muted" truncate className="dashboard-amplify-url">
									{ site.hostname }
								</Text>
							</VStack>
						</div>
					) ) }
				</div>
			) }
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
				describedBy={ describedBy }
				combobox={ {
					expanded: showOptions,
					listId,
					activeId: showOptions && activeIndex >= 0 ? `${ idPrefix }-${ activeIndex }` : undefined,
				} }
			/>
			{ portalSuggestions && suggestionList
				? createPortal( suggestionList, document.body )
				: suggestionList }
		</div>
	);
}
