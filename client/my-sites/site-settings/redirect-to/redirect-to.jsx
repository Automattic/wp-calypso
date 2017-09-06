/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import page from 'page';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { isSiteAutomatedTransfer } from 'state/selectors';

const redirectNonJetpack = ( WrappedComponent, redirectUrl ) => {
	class RedirectNonJetpack extends Component {
		static propTypes = {
			redirectUrl: PropTypes.string,
			// Connected props
			siteIsAtomic: PropTypes.bool,
			siteIsJetpack: PropTypes.bool,
			siteSlug: PropTypes.string
		}

		componentDidMount() {
			this.verifySiteIsJetpack();
		}

		componentDidUpdate() {
			this.verifySiteIsJetpack();
		}

		verifySiteIsJetpack() {
			if ( this.props.siteIsJetpack === false || this.props.siteIsAtomic ) {
				this.redirectTo();
			}
		}

		redirectTo = () => {
			const { siteSlug } = this.props;

			if ( siteSlug ) {
				const url = redirectUrl ? redirectUrl : '/settings/general/';

				page( url + siteSlug );
			}
		};

		render() {
			return (
				<WrappedComponent
					redirectTo={ this.redirectTo }
					{ ...this.props }
				/>
			);
		}
	}
	const connectComponent = connect(
		( state ) => {
			const siteId = getSelectedSiteId( state );

			return {
				siteIsAtomic: isSiteAutomatedTransfer( state, siteId ),
				siteIsJetpack: isJetpackSite( state, siteId ),
				siteSlug: getSelectedSiteSlug( state ),
			};
		}
	);

	return flowRight(
		connectComponent,
		localize
	)( RedirectNonJetpack );
};

export default redirectNonJetpack;
