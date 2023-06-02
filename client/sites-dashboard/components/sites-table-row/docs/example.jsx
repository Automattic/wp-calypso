import sampleSiteData from '../../docs/sample-site-data';
import SitesTableRow from '../../sites-table-row';

const CONTAINER_STYLES = {
	backgroundColor: 'white',
	border: '1px solid lightgray',
	padding: '16px',
};

const SitesTableRowExample = () => {
	return (
		<div>
			<div style={ CONTAINER_STYLES }>
				<table>
					<tbody>
						{ sampleSiteData.map( ( site ) => (
							<SitesTableRow site={ site } key={ site.ID } />
						) ) }
					</tbody>
				</table>
			</div>
		</div>
	);
};

SitesTableRowExample.displayName = 'SitesTableRow';

export default SitesTableRowExample;
