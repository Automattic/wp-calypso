import { CheckboxControl, Spinner } from '@wordpress/components';
import { useSitesQuery } from 'calypso/data/sites/use-sites-query';

type Props = {
	selectedSites: number[];
	setSelectedSites: ( sites: number[] ) => void;
};

export const SitePicker = ( { selectedSites, setSelectedSites }: Props ) => {
	const { data: sites = [], isFetched } = useSitesQuery();

	const handleCheckboxChange = ( site: number ) => {
		if ( selectedSites.includes( site ) ) {
			setSelectedSites( selectedSites.filter( ( s ) => s !== site ) );
		} else {
			setSelectedSites( [ ...selectedSites, site ] );
		}
	};

	return (
		<div className="form-field">
			<label htmlFor="plugins">Select sites</label>

			<div className="checkbox-options">
				<div className="checkbox-options-container">
					{ ! isFetched && <Spinner /> }

					{ isFetched &&
						sites.map( ( site ) => (
							<CheckboxControl
								key={ site.ID }
								label={ site.name }
								checked={ selectedSites.includes( site.ID ) }
								onChange={ () => handleCheckboxChange( site.ID ) }
							/>
						) ) }
				</div>
			</div>
		</div>
	);
};
