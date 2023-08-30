import { SearchIcon, type ImperativeHandle as SearchImperativeHandle } from '@automattic/search';
import { GroupableSiteLaunchStatuses, useSitesListGrouping } from '@automattic/sites';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import page from 'page';
import { ComponentPropsWithoutRef, useEffect, useRef } from 'react';
import SelectDropdown from 'calypso/components/select-dropdown';
import { MEDIA_QUERIES } from '../utils';
import { SitesDisplayModeSwitcher } from './sites-display-mode-switcher';
import { SitesSearch } from './sites-search';
import { SitesSortingDropdown } from './sites-sorting-dropdown';

export interface SitesDashboardQueryParams {
	page?: number;
	perPage?: number;
	search?: string;
	showHidden?: boolean;
	status?: GroupableSiteLaunchStatuses;
	newSiteID?: number;
}

const FilterBar = styled.div( {
	display: 'flex',
	alignItems: 'center',
	gap: '16px',
	paddingBlock: '32px',
	paddingInline: 0,

	flexDirection: 'column',

	[ MEDIA_QUERIES.mediumOrLarger ]: {
		flexDirection: 'row',
	},

	[ MEDIA_QUERIES.mediumOrSmaller ]: {
		paddingBlock: '16px',
	},
} );

const DisplayControls = styled.div( {
	gap: '16px',
	display: 'flex',
	alignItems: 'center',
	alignSelf: 'stretch',
	flex: 1,

	[ MEDIA_QUERIES.small ]: {
		flexDirection: 'column',
	},
} );

const VisibilityControls = styled.div( {
	display: 'flex',
	gap: '10px',
	flexShrink: 0,
	alignItems: 'center',

	[ MEDIA_QUERIES.small ]: {
		width: '100%',
		justifyContent: 'space-between',
	},

	[ MEDIA_QUERIES.mediumOrLarger ]: {
		marginInlineStart: 'auto',
	},
} );

const ControlsSelectDropdown = styled( SelectDropdown )( {
	width: '100%',

	'.select-dropdown__container': {
		minWidth: '100%',

		[ MEDIA_QUERIES.mediumOrLarger ]: {
			minWidth: 'fit-content',
		},
	},
} );

type Statuses = ReturnType< typeof useSitesListGrouping >[ 'statuses' ];

type SitesContentControlsProps = {
	initialSearch?: string;
	onQueryParamChange?: ( params: Partial< SitesDashboardQueryParams > ) => void;
	statuses: Statuses;
	selectedStatus: Statuses[ number ];
} & ComponentPropsWithoutRef< typeof SitesDisplayModeSwitcher > &
	ComponentPropsWithoutRef< typeof SitesSortingDropdown >;

/**
 * Updates one or more query param used by the sites dashboard, causing a page navigation.
 * Param will be removed if it is empty or matches its default value.
 * @param queryParams Query parameters to assign to the URL.
 */
export function handleQueryParamChange( queryParams: SitesDashboardQueryParams ) {
	const url = new URL( window.location.href );
	Object.keys( queryParams ).forEach( ( key ) => {
		const value = queryParams[ key as keyof SitesDashboardQueryParams ];
		if ( value ) {
			url.searchParams.set( key, value.toString() );
		} else {
			url.searchParams.delete( key );
		}
	} );

	// Use relative URL to avoid full page refresh.
	page.replace( url.pathname + url.search );
}

export const SitesContentControls = ( {
	initialSearch,
	onQueryParamChange = handleQueryParamChange,
	statuses,
	selectedStatus,
	displayMode,
	onDisplayModeChange,
	sitesSorting,
	onSitesSortingChange,
	hasSitesSortingPreferenceLoaded,
}: SitesContentControlsProps ) => {
	const { __ } = useI18n();
	const searchRef = useRef< SearchImperativeHandle >( null );

	useSearchShortcut( () => {
		searchRef.current?.focus();
	} );

	return (
		<FilterBar>
			<SitesSearch
				searchIcon={ <SearchIcon /> }
				onSearch={ ( term ) => onQueryParamChange( { search: term?.trim(), page: undefined } ) }
				isReskinned
				placeholder={ __( 'Search by name or domain…' ) }
				disableAutocorrect={ true }
				defaultValue={ initialSearch }
				ref={ searchRef }
			/>
			<DisplayControls>
				<ControlsSelectDropdown
					// Translators: `siteStatus` is one of the site statuses specified in the Sites page.
					selectedText={ sprintf( __( 'Status: %(siteStatus)s' ), {
						siteStatus: selectedStatus.title,
					} ) }
					ariaLabel={
						'all' === selectedStatus.name
							? __( 'Displaying all sites.' )
							: sprintf(
									// Translators: `siteStatus` is one of the site statuses specified in the Sites page.
									__( 'Filtering to sites with status "%(siteStatus)s".' ),
									{
										siteStatus: selectedStatus.title,
									}
							  )
					}
				>
					{ statuses.map( ( { name, title, count } ) => (
						<SelectDropdown.Item
							key={ name }
							selected={ name === selectedStatus.name }
							count={ count }
							// Translators: `siteStatus` is one of the site statuses specified in the Sites page. `count` is a number of sites of given status.
							ariaLabel={ sprintf( __( '%(siteStatus)s (%(count)d sites)' ), {
								siteStatus: title,
								count,
							} ) }
							onClick={ () =>
								onQueryParamChange( {
									status: 'all' !== name ? name : undefined,
									page: undefined,
								} )
							}
						>
							{ title }
						</SelectDropdown.Item>
					) ) }
				</ControlsSelectDropdown>
				<VisibilityControls>
					<SitesSortingDropdown
						hasSitesSortingPreferenceLoaded={ hasSitesSortingPreferenceLoaded }
						sitesSorting={ sitesSorting }
						onSitesSortingChange={ onSitesSortingChange }
					/>
					{ onDisplayModeChange && (
						<SitesDisplayModeSwitcher
							displayMode={ displayMode }
							onDisplayModeChange={ onDisplayModeChange }
						/>
					) }
				</VisibilityControls>
			</DisplayControls>
		</FilterBar>
	);
};

function useSearchShortcut( callback: () => void ) {
	const callbackRef = useRef( callback );
	callbackRef.current = callback;

	useEffect( () => {
		const handleKeyDown = ( event: KeyboardEvent ) => {
			// Don't trigger the shortcut if the user is typing in an input field.
			if (
				document.activeElement?.tagName === 'INPUT' ||
				document.activeElement?.tagName === 'TEXTAREA' ||
				( document.activeElement as HTMLElement | null )?.isContentEditable
			) {
				return;
			}

			if ( event.key === '/' && callbackRef.current ) {
				event.preventDefault();
				callbackRef.current();
			}
		};
		window.addEventListener( 'keydown', handleKeyDown );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown );
		};
	} );
}
