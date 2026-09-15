import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutColumn from 'calypso/layout/hosting-dashboard/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/layout/hosting-dashboard/header';
import LayoutTop from 'calypso/layout/hosting-dashboard/top';
import type { AggregatedTheme, ThemeSiteInstance } from '../../types';

const getDisplayUrl = ( url: string ) => url.replace( /^https?:\/\//, '' );

export default function ThemeSitesPane( {
	theme,
	onClose,
	onUpdateSite,
	isSiteUpdating,
}: {
	theme: AggregatedTheme;
	onClose: () => void;
	onUpdateSite: ( theme: AggregatedTheme, site: ThemeSiteInstance ) => void;
	isSiteUpdating: ( themeId: string, siteId: number ) => boolean;
} ) {
	return (
		<LayoutColumn className="plugin-manage-sites-pane" wide>
			<LayoutTop withNavigation={ false }>
				<LayoutHeader>
					<Title>
						{ theme.screenshot && (
							<img
								className="themes-dashboard__sites-pane-screenshot"
								width={ 24 }
								height={ 24 }
								src={ theme.screenshot }
								alt={ theme.name }
							/>
						) }
						{ theme.name }
					</Title>
					<Actions>
						<Button variant="tertiary" onClick={ onClose } aria-label={ __( 'Close' ) }>
							<Gridicon icon="cross" size={ 24 } />
						</Button>
					</Actions>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<table className="themes-sites-table">
					<thead>
						<tr>
							<th>{ __( 'Site' ) }</th>
							<th>{ __( 'Version' ) }</th>
							<th>{ __( 'Status' ) }</th>
							<th>{ __( 'Update available' ) }</th>
						</tr>
					</thead>
					<tbody>
						{ theme.sites.map( ( site ) => (
							<tr key={ site.siteId }>
								<td>
									<div className="themes-sites-table__site-title">{ site.siteTitle }</div>
									<a
										className="themes-sites-table__site-url"
										href={ site.siteUrl }
										target="_blank"
										rel="noreferrer"
									>
										{ getDisplayUrl( site.siteUrl ) }
									</a>
								</td>
								<td>{ site.version }</td>
								<td>
									{ site.active ? (
										<span className="themes-sites-table__active-badge">{ __( 'Active' ) }</span>
									) : (
										__( 'Inactive' )
									) }
								</td>
								<td>
									{ isSiteUpdating( theme.id, site.siteId ) && (
										<span className="themes-dashboard__updating">{ __( 'Updating…' ) }</span>
									) }
									{ ! isSiteUpdating( theme.id, site.siteId ) &&
										( site.newVersion ? (
											<Button variant="secondary" onClick={ () => onUpdateSite( theme, site ) }>
												{ sprintf(
													/* translators: %s is the new theme version */
													__( 'Update to version %s' ),
													site.newVersion
												) }
											</Button>
										) : (
											__( 'No' )
										) ) }
								</td>
							</tr>
						) ) }
					</tbody>
				</table>
			</LayoutBody>
		</LayoutColumn>
	);
}
