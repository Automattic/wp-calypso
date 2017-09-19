/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';
import SiteSelector from 'components/site-selector';
import { getPrimarySiteId } from 'state/selectors';

export class SitesDropdown extends PureComponent {
	static propTypes = {
		selectedSiteId: PropTypes.number,
		showAllSites: PropTypes.bool,
		onClose: PropTypes.func,
		onSiteSelect: PropTypes.func,
		filter: PropTypes.func,
		isPlaceholder: PropTypes.bool,

		// connected props
		selectedSite: PropTypes.object,
	}

	static defaultProps = {
		showAllSites: false,
		onClose: noop,
		onSiteSelect: noop,
		isPlaceholder: false,
	}

	constructor( props ) {
		super( props );

		// needed to be done in constructor b/c spy tests
		this.selectSite = this.selectSite.bind( this );
		this.siteFilter = this.siteFilter.bind( this );
		this.toggleOpen = this.toggleOpen.bind( this );
		this.onClose = this.onClose.bind( this );

		this.state = {
			selectedSiteId: this.props.selectedSiteId || this.props.primarySiteId
		};
	}

	selectSite( siteId ) {
		this.props.onSiteSelect( siteId );
		this.setState( {
			selectedSiteId: siteId,
			open: false
		} );
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
							: <Site siteId={ this.state.selectedSiteId } indicator={ false } />
						}
						<Gridicon icon="chevron-down" />
					</div>
					{ this.state.open &&
						<SiteSelector
							autoFocus={ true }
							onClose={ this.onClose }
							onSiteSelect={ this.selectSite }
							selected={ this.state.selectedSiteId }
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
