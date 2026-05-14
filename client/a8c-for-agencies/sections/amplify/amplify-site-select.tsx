import { Button, Dropdown, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import useConnectedSites from './hooks/use-connected-sites';

const RECENT_LIMIT = 10;

type Props = {
	/**
	 * Called when the user hits "Amplify it". AmplifyPage owns the analysis
	 * modal — this component just signals which URL to analyse.
	 */
	onSiteSelected: ( url: string ) => void;
};

export default function AmplifySiteSelect( { onSiteSelected }: Props ) {
	const dispatch = useDispatch();
	const [ selectedUrl, setSelectedUrl ] = useState< string | null >( null );
	const [ search, setSearch ] = useState( '' );

	const { sites, isLoading, hasAnyConnectedSites } = useConnectedSites( {
		search,
		limit: RECENT_LIMIT,
	} );

	const isDisabled = isLoading || ! hasAnyConnectedSites;

	let toggleText: string;
	if ( selectedUrl ) {
		toggleText = selectedUrl;
	} else if ( isLoading ) {
		toggleText = __( 'Loading sites…' );
	} else if ( ! hasAnyConnectedSites ) {
		toggleText = __( 'No connected sites yet' );
	} else {
		toggleText = __( 'Search or select a site' );
	}

	const handleSelectSite = ( url: string ) => {
		setSelectedUrl( url );
		dispatch(
			recordTracksEvent( 'calypso_a4a_amplify_site_select', { site_url: url } )
		);
	};

	const handleAmplifyClick = () => {
		if ( ! selectedUrl ) {
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_a4a_amplify_audit_open', { site_url: selectedUrl } )
		);
		onSiteSelected( selectedUrl );
	};

	return (
		<div className="amplify-landing-selector">
			<div className="amplify-landing-selector-field">
				<span className="amplify-landing-selector-label">
					{ __( 'Recently connected sites' ) }
				</span>
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
							{ sites.length === 0 ? (
								<p className="amplify-landing-site-dropdown-empty">
									{ __( 'No matches' ) }
								</p>
							) : (
								<ul className="amplify-landing-site-dropdown-list" role="listbox">
									{ sites.map( ( site ) => {
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
														handleSelectSite( site.url );
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
				onClick={ handleAmplifyClick }
			>
				{ __( 'Amplify it' ) }
			</Button>
		</div>
	);
}
