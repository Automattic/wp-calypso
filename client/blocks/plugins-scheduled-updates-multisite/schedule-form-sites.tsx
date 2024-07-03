import { getPlan, PLAN_BUSINESS } from '@automattic/calypso-products';
import { __experimentalText as Text, CheckboxControl, SearchControl } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, Fragment, useCallback, useState } from 'react';
import type { SiteExcerptData } from '@automattic/sites';

interface Props {
	sites?: SiteExcerptData[];
	selectedSites?: number[];
	error?: string;
	showError?: boolean;
	onChange?: ( value: number[] ) => void;
	onTouch?: ( touched: boolean ) => void;
	borderWrapper?: boolean;
}
export const ScheduleFormSites = ( props: Props ) => {
	const {
		sites = [],
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
			<div className={ clsx( { 'form-control-container': borderWrapper } ) }>
				{ ( ( showError && error ) || ( fieldTouched && error ) ) && (
					<Text className="validation-msg">
						<Icon className="icon-info" icon={ info } size={ 16 } />
						{ error }
					</Text>
				) }
				{ !! sites.length && (
					<SearchControl
						id="sites"
						value={ searchTerm }
						onChange={ ( s ) => setSearchTerm( s.trim() ) }
						placeholder={ translate( 'Search sites' ) }
					/>
				) }
				{ ! sites.length && (
					<p className="placeholder-info">
						{ translate(
							// Translators: %(planName)s is the plan - Business or Creator
							'To select a site, please ensure it has a %(planName)s plan or higher.{{br/}}Upgrade your site to proceed.',
							{
								components: {
									br: <br />,
								},
								args: {
									planName: getPlan( PLAN_BUSINESS )?.getTitle() ?? '',
								},
							}
						) }
					</p>
				) }
				<div className="checkbox-options-container checkbox-options-container__sites">
					{ sites.map( ( site ) => (
						<Fragment key={ site.ID }>
							{ site?.name &&
								( site.name.toLowerCase().includes( searchTerm.toLowerCase() ) ||
									site.slug.toLowerCase().includes( searchTerm.toLowerCase() ) ) && (
									<div>
										<CheckboxControl
											key={ site.ID }
											onChange={ ( isChecked ) => {
												onSiteSelectionChange( site, isChecked );
												setFieldTouched( true );
											} }
											checked={ selectedSites.includes( site.ID ) }
										/>
										<label htmlFor={ `${ site.ID }` }>
											{ site.name }
											<br />
											<span className="site-slug">{ site.slug }</span>
										</label>
									</div>
								) }
						</Fragment>
					) ) }
				</div>
			</div>
		</div>
	);
};
