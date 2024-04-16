import { CheckboxControl, SearchControl } from '@wordpress/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useCallback, useState } from 'react';
import type { SiteExcerptData } from '@automattic/sites';

interface Props {
	sites: SiteExcerptData[];
	initSites?: number[];
	borderWrapper?: boolean;
}
export const ScheduleFormSites = ( props: Props ) => {
	const { sites, initSites = [], borderWrapper = true } = props;
	const translate = useTranslate();
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ selectedSites, setSelectedSites ] = useState< number[] >( initSites );

	const onSiteSelectionChange = useCallback( ( site: SiteExcerptData, isChecked: boolean ) => {
		if ( isChecked ) {
			const _sites: number[] = [ ...selectedSites ];
			_sites.push( site.ID );
			setSelectedSites( _sites );
		} else {
			setSelectedSites( selectedSites.filter( ( id ) => id !== site.ID ) );
		}
	}, [] );

	return (
		<div className="form-field">
			<label htmlFor="sites">{ translate( 'Select sites' ) }</label>
			<div className={ classnames( { 'form-control-container': borderWrapper } ) }>
				<SearchControl
					id="sites"
					onChange={ ( s ) => setSearchTerm( s.trim() ) }
					placeholder={ translate( 'Search site' ) }
				/>
				<div className="checkbox-options-container">
					{ sites.map( ( site ) => (
						<Fragment key={ site.ID }>
							{ site?.name && site.name.toLowerCase().includes( searchTerm.toLowerCase() ) && (
								<CheckboxControl
									key={ site.ID }
									label={ site.name }
									onChange={ ( isChecked ) => {
										onSiteSelectionChange( site, isChecked );
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
