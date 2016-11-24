/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import QuerySites from 'components/data/query-sites';
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import SiteSelector from 'components/site-selector';
import Gridicon from 'components/gridicon';
import sitesList from 'lib/sites-list';
import { getSite } from 'state/sites/selectors';

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
		this.toggleDropdown = this.toggleDropdown.bind( this );
		this.onClose = this.onClose.bind( this );

		const selectedSite = props.primarySite || sites.getPrimary();

		this.state = {
			selectedSiteSlug: selectedSite && selectedSite.slug
		};
	}

	componentWillReceiveProps( nextProps ) {
		const { primarySite } = nextProps;
		if ( primarySite && primarySite.slug !== this.state.selectedSiteSlug ) {
			this.setState( {
				selectedSiteSlug: primarySite.slug
			} );
		}
	}

	selectSite( siteSlug ) {
		this.props.onSiteSelect( siteSlug );
		this.setState( {
			selectedSiteSlug: siteSlug,
			open: false
		} );
	}

	toggleDropdown() {
		this.setState( { open: ! this.state.open } );
	}

	onClose( e ) {
		this.setState( { open: false } );
		this.props.onClose && this.props.onClose( e );
	}

	render() {
		return (
			<div className={ classNames( 'sites-dropdown', { 'is-open': this.state.open } ) }>
				<QuerySites allSites={ true } />
				<div className="sites-dropdown__wrapper">
					<div
						className="sites-dropdown__selected"
						onClick={ this.toggleDropdown } >
						{
							this.props.isPlaceholder || this.props.primarySite == null
							? <SitePlaceholder />
							: <Site site={ this.props.primarySite } indicator={ false } />
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

const mapStateToProps = ( state, ownProps ) => ( {
	primarySite: getSite( state, ownProps.selectedSiteId ),
} );

export { mapStateToProps };

export default connect( mapStateToProps )( SitesDropdown );
