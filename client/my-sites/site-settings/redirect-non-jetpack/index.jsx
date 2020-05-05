/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import page from 'page';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

const redirectNonJetpack = ( redirectRoute ) => ( WrappedComponent ) => {
	class RedirectNonJetpack extends Component {
		static propTypes = {
			// Connected props
			siteIsAtomic: PropTypes.bool,
			siteIsJetpack: PropTypes.bool,
			siteSlug: PropTypes.string,
		};

		componentDidMount() {
			this.redirectIfNoAccess();
		}

		componentDidUpdate() {
			this.redirectIfNoAccess();
		}

		redirectIfNoAccess() {
			if ( this.props.siteIsJetpack === false || this.props.siteIsAtomic ) {
				this.redirect();
			}
		}

		redirect = () => {
			const { siteSlug } = this.props;

			if ( redirectRoute ) {
				return page( redirectRoute );
			}

			if ( siteSlug ) {
				page( '/settings/general/' + siteSlug );
			}
		};

		render() {
			return <WrappedComponent redirect={ this.redirect } { ...this.props } />;
		}
	}

	return connect( ( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteIsAtomic: isSiteAutomatedTransfer( state, siteId ),
			siteIsJetpack: isJetpackSite( state, siteId ),
			siteSlug: getSelectedSiteSlug( state ),
		};
	} )( RedirectNonJetpack );
};

export default redirectNonJetpack;
