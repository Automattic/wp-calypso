import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import hasGravatarDomainQueryParam from 'calypso/state/selectors/has-gravatar-domain-query-param';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';

const loadCheckout = () =>
	import( /* webpackChunkName: "async-load-calypso-layout-masterbar-checkout" */ './checkout.tsx' );

class MasterbarLoggedIn extends Component {
	static propTypes = {
		isCheckoutPending: PropTypes.bool,
		isCheckoutFailed: PropTypes.bool,
		loadHelpCenterIcon: PropTypes.bool,
		isGravatarDomain: PropTypes.bool,
	};

	render() {
		const {
			isCheckoutPending,
			isCheckoutFailed,
			previousPath,
			currentSelectedSiteSlug,
			isJetpackNotAtomic,
			title,
			loadHelpCenterIcon,
			isGravatarDomain,
		} = this.props;

		return (
			<AsyncLoad
				require={ loadCheckout }
				placeholder={ null }
				title={ title }
				isJetpackNotAtomic={ isJetpackNotAtomic }
				previousPath={ previousPath }
				siteSlug={ currentSelectedSiteSlug }
				isLeavingAllowed={ ! isCheckoutPending }
				shouldClearCartWhenLeaving={ ! isCheckoutFailed }
				loadHelpCenterIcon={ loadHelpCenterIcon }
				isGravatarDomain={ isGravatarDomain }
			/>
		);
	}
}

export { MasterbarLoggedIn };

const ConnectedMasterbarLoggedIn = connect( ( state, { siteId } ) => ( {
	currentSelectedSiteSlug: siteId ? getSiteSlug( state, siteId ) : undefined,
	previousPath: getPreviousRoute( state ),
	isJetpackNotAtomic: isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ),
	isGravatarDomain: hasGravatarDomainQueryParam( state ),
} ) )( MasterbarLoggedIn );

export default ConnectedMasterbarLoggedIn;
