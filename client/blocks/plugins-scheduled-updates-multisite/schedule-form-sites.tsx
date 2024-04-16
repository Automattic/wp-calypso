import { __experimentalText as Text, CheckboxControl, SearchControl } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, Fragment, useCallback, useState } from 'react';
import type { SiteExcerptData } from '@automattic/sites';

interface Props {
	sites: SiteExcerptData[];
	selectedSites?: number[];
	error?: string;
	showError?: boolean;
	onChange?: ( value: number[] ) => void;
	onTouch?: ( touched: boolean ) => void;
	borderWrapper?: boolean;
}
export const ScheduleFormSites = ( props: Props ) => {
	const {
		sites,
		selectedSites: initSites = [],
		error,
		showError,
		onChange,
		onTouch,
		borderWrapper = true,
	} = props;
	const translate = useTranslate();
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ selectedSites, setSelectedSites ] = useState< number[] >( initSites );
	const [ fieldTouched, setFieldTouched ] = useState( false );

	useEffect( () => onTouch?.( fieldTouched ), [ fieldTouched ] );
	useEffect( () => onChange?.( selectedSites ), [ selectedSites ] );

	const onSiteSelectionChange = useCallback(
		( site: SiteExcerptData, isChecked: boolean ) => {
			if ( isChecked ) {
				const _sites: number[] = [ ...selectedSites ];
				_sites.push( site.ID );
				setSelectedSites( _sites );
			} else {
				setSelectedSites( selectedSites.filter( ( id ) => id !== site.ID ) );
			}
		},
		[ selectedSites ]
	);

	return (
		<div className="form-field">
			<label htmlFor="sites">{ translate( 'Select sites' ) }</label>
			<div className={ classnames( { 'form-control-container': borderWrapper } ) }>
				{ ( ( showError && error ) || ( fieldTouched && error ) ) && (
					<Text className="validation-msg">
						<Icon className="icon-info" icon={ info } size={ 16 } />
						{ error }
					</Text>
				) }
				<SearchControl
					id="sites"
					onChange={ ( s ) => setSearchTerm( s.trim() ) }
					placeholder={ translate( 'Search site' ) }
				/>
				{ ! sites.length && (
					<Text className="info-msg">
						You can only select sites with Creator plan. Please upgrade your site to enable this
						feature.
					</Text>
				) }
				<div className="checkbox-options-container">
					{ sites.map( ( site ) => (
						<Fragment key={ site.ID }>
							{ site?.name && site.name.toLowerCase().includes( searchTerm.toLowerCase() ) && (
								<CheckboxControl
									key={ site.ID }
									label={ site.name }
									onChange={ ( isChecked ) => {
										onSiteSelectionChange( site, isChecked );
										setFieldTouched( true );
									} }
									checked={ selectedSites.includes( site.ID ) }
								/>
							) }
						</Fragment>
					) ) }
				</div>
			</div>
		</div>
	);
};
