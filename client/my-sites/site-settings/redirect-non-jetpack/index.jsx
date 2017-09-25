/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import page from 'page';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { isSiteAutomatedTransfer } from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

const redirectNonJetpack = redirectRoute => WrappedComponent => {
	class RedirectNonJetpack extends Component {
		static propTypes = {
			// Connected props
			siteIsAtomic: PropTypes.bool,
			siteIsJetpack: PropTypes.bool,
			siteSlug: PropTypes.string
		}

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
			return (
				<WrappedComponent
					redirect={ this.redirect }
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
