/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import noop from 'lodash/utility/noop';

/**
 * Internal dependencies
 */
import Site from 'my-sites/site';
import SiteSelector from 'components/site-selector';
import sitesList from 'lib/sites-list';
import Gridicon from 'components/gridicon';

const sites = sitesList();

export default React.createClass( {

	displayName: 'SitesDropdown',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		selected: React.PropTypes.oneOfType( [
			React.PropTypes.number,
			React.PropTypes.string
		] ),
		showAllSites: React.PropTypes.bool,
		indicator: React.PropTypes.bool,
		autoFocus: React.PropTypes.bool,
		onClose: React.PropTypes.func
	},

	getDefaultProps() {
		return {
			showAllSites: false,
			indicator: false,
			onClose: noop
		};
	},

	getInitialState() {
		return {
			search: '',
			selected: this.props.selected || sites.getPrimary().slug
		};
	},

	getSelectedSite() {
		return sites.getSite( this.state.selected ) || sites.getPrimary();
	},

	selectSite( siteSlug ) {
		this.setState( {
			selected: siteSlug,
			open: false
		} );
	},

	render() {
		return (
			<div className={ classNames( 'sites-dropdown', { 'is-open': this.state.open } ) }>
				<div
					className="sites-dropdown__selected"
					onClick={ () => this.setState( { open: ! this.state.open } ) }
				>
					<Site
						site={ this.getSelectedSite() }
					/>
					<Gridicon icon={ this.state.open ? 'chevron-up' : 'chevron-down' } />
				</div>
				{ this.state.open &&
					<SiteSelector
						sites={ sites }
						autoFocus={ true }
						onClose={ this.props.onClose }
						onSiteSelect={ this.selectSite }
						selected={ this.state.selected }
						hideSelected={ true }
					/>
				}
			</div>
		);
	}
} );
