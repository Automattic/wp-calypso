import page from '@automattic/calypso-router';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isHostingMenuUntangled } from 'calypso/sites/settings/utils';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

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
				if ( isHostingMenuUntangled() ) {
					page( '/sites/settings/administration/' + siteSlug );
				} else {
					page( '/settings/general/' + siteSlug );
				}
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
