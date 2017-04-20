/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
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
import { getSite } from 'state/sites/selectors';
import { getSelectedOrPrimarySiteId } from 'state/selectors';

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

	state = {
		selectedSiteId: this.props.selectedOrPrimarySiteId,
	}

	selectSite = ( siteID ) => {
		this.props.onSiteSelect( siteID );
		this.setState( {
			selectedSiteId: siteID,
			open: false
		} );
	}

	toggleOpen = () => {
		this.setState( { open: ! this.state.open } );
	}

	onClose = ( e ) => {
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
							: <Site site={ this.props.getSite( this.state.selectedSiteId ) } indicator={ false } />
						}
						<Gridicon icon="chevron-down" />
					</div>
					{ this.state.open &&
						<SiteSelector
							sites={ sites }
							autoFocus={ true }
							onClose={ this.onClose }
							onSiteSelect={ this.selectSite }
							selected={ this.state.selectedSiteId }
							hideSelected={ true }
							filter={ this.props.filter }
						/>
					}
				</div>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		getSite: ( siteId ) => getSite( state, siteId ),
		selectedOrPrimarySiteId: getSelectedOrPrimarySiteId( state ),
	} )
)( SitesDropdown );
