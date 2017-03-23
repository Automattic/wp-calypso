/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import notices from 'notices';
import QuerySitePurchases from 'components/data/query-site-purchases';
import QuerySiteSettings from 'components/data/query-site-settings';
import { getSitePurchases, hasLoadedSitePurchasesFromServer, getPurchasesError } from 'state/purchases/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import SeoForm from './form';

/**
 * Module vars
 */
const debug = debugFactory( 'calypso:my-sites:site-settings' );

export class SeoSettings extends Component {
	constructor( props ) {
		super( props );

		// bound methods
		this.updateSite = this.updateSite.bind( this );

		this.state = {
			site: this.props.sites.getSelectedSite()
		};
	}

	componentWillMount() {
		debug( 'Mounting SiteSettings React component.' );
		this.props.sites.on( 'change', this.updateSite );
	}

	componentWillUnmount() {
		this.props.sites.off( 'change', this.updateSite );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.purchasesError ) {
			notices.error( nextProps.purchasesError );
		}
	}

	render() {
		const { site } = this.state;
		const { upgradeToBusiness } = this.props;

		return (
			<div>
				{ site && <QuerySiteSettings siteId={ site.ID } /> }
				{ site && <QuerySitePurchases siteId={ site.ID } /> }
				{ site && <SeoForm { ...{ site, upgradeToBusiness } } /> }
			</div>
		);
	}

	updateSite() {
		this.setState( { site: this.props.sites.getSelectedSite() } );
	}
}

SeoSettings.propTypes = {
	hasLoadedSitePurchasesFromServer: PropTypes.bool.isRequired,
	purchasesError: PropTypes.object,
	section: PropTypes.string,
	sitePurchases: PropTypes.array.isRequired,
	sites: PropTypes.object.isRequired
};

export default connect(
	( state ) => {
		return {
			hasLoadedSitePurchasesFromServer: hasLoadedSitePurchasesFromServer( state ),
			purchasesError: getPurchasesError( state ),
			sitePurchases: getSitePurchases( state, getSelectedSiteId( state ) )
		};
	}
)( SeoSettings );
