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

const redirectNonJetpackToGeneral = ( WrappedComponent ) => {
	class RedirectNonJetpackToGeneral extends Component {
		static propTypes = {
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
				this.redirectToGeneral();
			}
		}

		redirectToGeneral = () => {
			const { siteSlug } = this.props;

			if ( siteSlug ) {
				page( '/settings/general/' + siteSlug );
			}
		};

		render() {
			return (
				<WrappedComponent
					redirectToGeneral={ this.redirectToGeneral }
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
	)( RedirectNonJetpackToGeneral );
};

export default redirectNonJetpackToGeneral;
