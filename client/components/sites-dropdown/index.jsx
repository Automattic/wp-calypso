/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, noop } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import SiteSelector from 'components/site-selector';
import sitesList from 'lib/sites-list';
import { getPrimarySiteId } from 'state/selectors';

const sites = sitesList();

export class SitesDropdown extends PureComponent {
	static propTypes = {
		selectedSiteId: React.PropTypes.number,
		showAllSites: React.PropTypes.bool,
		onClose: React.PropTypes.func,
		onSiteSelect: React.PropTypes.func,
		filter: React.PropTypes.func,
		isPlaceholder: React.PropTypes.bool
	}

	static defaultProps = {
		showAllSites: false,
		onClose: noop,
		onSiteSelect: noop,
		isPlaceholder: false
	}

	constructor( props ) {
		super( props );

		this.selectSite = this.selectSite.bind( this );
		this.getSelectedSite = this.getSelectedSite.bind( this );
		this.siteFilter = this.siteFilter.bind( this );
		this.toggleOpen = this.toggleOpen.bind( this );
		this.onClose = this.onClose.bind( this );

		this.state = {
			selectedSiteId: this.props.selectedSiteId || this.props.primarySiteId
		};
	}

	selectSite( siteSlug ) {
		// SiteSelector gives us a slug, but we want to pass an ID to our onSiteSelect
		// callback prop so it's consistent with the selectedSiteId prop. We also use
		// a siteId for our internal state.
		// TODO: Change SiteSelector to also use site IDs instead of slugs and objects.
		const siteId = get( sites.getSite( siteSlug ), 'ID' );
		this.props.onSiteSelect( siteId );
		this.setState( {
			selectedSiteId: siteId,
			open: false
		} );
	}

	getSelectedSite() {
		return sites.getSite( this.state.selectedSiteId );
	}

	// Our filter prop handles siteIds, while SiteSelector's filter prop needs objects
	siteFilter( site ) {
		return this.props.filter( site.ID );
	}

	toggleOpen() {
		this.setState( { open: ! this.state.open } );
	}

	onClose( e ) {
		this.setState( { open: false } );
		this.props.onClose && this.props.onClose( e );
	}

	render() {
		return (
			<div className={ classNames( 'sites-dropdown', { 'is-open': this.state.open } ) }>
				<div className="sites-dropdown__wrapper">
					<div
						className="sites-dropdown__selected"
						onClick={ this.toggleOpen } >
						{
							this.props.isPlaceholder
							? <SitePlaceholder />
							: <Site site={ this.getSelectedSite() } indicator={ false } />
						}
						<Gridicon icon="chevron-down" />
					</div>
					{ this.state.open &&
						<SiteSelector
							sites={ sites }
							autoFocus={ true }
							onClose={ this.onClose }
							onSiteSelect={ this.selectSite }
							selected={ get( this.getSelectedSite(), 'slug' ) }
							hideSelected={ true }
							filter={ this.props.filter && this.siteFilter }
						/>
					}
				</div>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		primarySiteId: getPrimarySiteId( state ),
	} )
)( SitesDropdown );
