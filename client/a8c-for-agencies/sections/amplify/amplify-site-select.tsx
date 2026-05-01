import { Button, Dropdown, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import useFetchActiveSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-active-sites';
import AmplifyAnalysisModal from './amplify-analysis-modal';

type Site = {
	id: number;
	url: string;
	features?: {
		wpcom_atomic?: {
			state?: string;
		};
	};
};

const RECENT_LIMIT = 10;

export default function AmplifySiteSelect() {
	const { data, isLoading } = useFetchActiveSites( { autoRefresh: false } );
	const [ selectedUrl, setSelectedUrl ] = useState< string | null >( null );
	const [ search, setSearch ] = useState( '' );
	const [ analysisFlowSite, setAnalysisFlowSite ] = useState< string | null >( null );

	const allSites: Site[] = useMemo( () => {
		const list = Array.isArray( data ) ? ( data as Site[] ) : [];
		return list
			.filter( ( site ) => {
				if ( ! site.url ) {
					return false;
				}
				const state = site.features?.wpcom_atomic?.state;
				return state === undefined || state === 'active';
			} )
			.sort( ( a, b ) => b.id - a.id );
	}, [ data ] );

	const visibleSites = useMemo( () => {
		const query = search.trim().toLowerCase();
		return query
			? allSites.filter( ( site ) => site.url.toLowerCase().includes( query ) )
			: allSites.slice( 0, RECENT_LIMIT );
	}, [ allSites, search ] );

	const hasSites = allSites.length > 0;
	const isDisabled = isLoading || ! hasSites;

	let toggleText: string;
	if ( selectedUrl ) {
		toggleText = selectedUrl;
	} else if ( isLoading ) {
		toggleText = __( 'Loading sites…' );
	} else if ( ! hasSites ) {
		toggleText = __( 'No connected sites yet' );
	} else {
		toggleText = __( 'Search or select a site' );
	}

	return (
		<div className="amplify-landing-selector">
			<div className="amplify-landing-selector-field">
				<span className="amplify-landing-selector-label">{ __( 'Recently connected sites' ) }</span>
				<Dropdown
					className="amplify-landing-site-dropdown"
					contentClassName="amplify-landing-site-dropdown-content"
					placement="bottom-start"
					popoverProps={ { offset: 4, shift: true } }
					onToggle={ ( isOpen ) => {
						if ( ! isOpen ) {
							setSearch( '' );
						}
					} }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<button
							type="button"
							className={ clsx( 'amplify-landing-site-dropdown-toggle', {
								'is-open': isOpen,
							} ) }
							disabled={ isDisabled }
							aria-expanded={ isOpen }
							aria-haspopup="listbox"
							onClick={ onToggle }
						>
							<span
								className={ clsx( 'amplify-landing-site-dropdown-value', {
									'is-placeholder': ! selectedUrl,
								} ) }
							>
								{ toggleText }
							</span>
							<Icon icon={ chevronDown } size={ 20 } />
						</button>
					) }
					renderContent={ ( { onClose } ) => (
						<div className="amplify-landing-site-dropdown-panel">
							<div className="amplify-landing-site-dropdown-search">
								<TextControl
									__nextHasNoMarginBottom
									__next40pxDefaultSize
									label={ __( 'Search' ) }
									hideLabelFromVision
									value={ search }
									onChange={ setSearch }
									placeholder={ __( 'Search connected sites' ) }
								/>
							</div>
							{ visibleSites.length === 0 ? (
								<p className="amplify-landing-site-dropdown-empty">{ __( 'No matches' ) }</p>
							) : (
								<ul className="amplify-landing-site-dropdown-list" role="listbox">
									{ visibleSites.map( ( site ) => {
										const isSelected = site.url === selectedUrl;
										return (
											<li key={ site.id }>
												<button
													type="button"
													role="option"
													aria-selected={ isSelected }
													className={ clsx( 'amplify-landing-site-dropdown-item', {
														'is-selected': isSelected,
													} ) }
													onClick={ () => {
														setSelectedUrl( site.url );
														onClose();
													} }
												>
													{ site.url }
												</button>
											</li>
										);
									} ) }
								</ul>
							) }
						</div>
					) }
				/>
			</div>
			<Button
				__next40pxDefaultSize
				variant="primary"
				disabled={ ! selectedUrl }
				onClick={ () => {
					if ( selectedUrl ) {
						setAnalysisFlowSite( selectedUrl );
					}
				} }
			>
				{ __( 'Amplify it' ) }
			</Button>
			<AmplifyAnalysisModal
				site={ analysisFlowSite }
				onClose={ () => setAnalysisFlowSite( null ) }
			/>
		</div>
	);
}
