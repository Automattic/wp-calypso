/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import SiteSelector from 'components/site-selector';
import sitesList from 'lib/sites-list';

const sites = sitesList();

export default class SitesDropdown extends PureComponent {

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
		this.toggleOpen = this.toggleOpen.bind( this );
		this.onClose = this.onClose.bind( this );

		const selectedSite = props.selectedSiteId
			? sites.getSite( props.selectedSiteId )
			: sites.getPrimary();

		this.state = {
			selectedSiteSlug: selectedSite && selectedSite.slug
		};
	}

	getSelectedSite() {
		return sites.getSite( this.state.selectedSiteSlug );
	}

	selectSite( siteSlug ) {
		this.props.onSiteSelect( siteSlug );
		this.setState( {
			selectedSiteSlug: siteSlug,
			open: false
		} );
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
							selected={ this.state.selectedSiteSlug }
							hideSelected={ true }
							filter={ this.props.filter }
						/>
					}
				</div>
			</div>
		);
	}
}
