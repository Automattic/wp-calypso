/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

import { recordTracksEvent } from 'state/analytics/actions';
import store from 'store';
import { localize } from 'i18n-calypso';
import { getRandomPromo, getPromoLink } from './lib/promo-retriever';
import { noop, identity } from 'lodash';

export const AppPromo = React.createClass( {

	displayName: 'AppPromo',

	propTypes: {
		location: React.PropTypes.string.isRequired
	},

	getInitialState: function() {
		return {
			show_promo: true
		};
	},

	componentDidMount: function() {
		this.props.recordTracksEvent( 'calypso_desktop_promo_view', {
			promo_location: this.props.location,
			promo_code: this.props.promoItem.promoCode,
		} );
	},

	recordClickEvent: function() {
		this.props.recordTracksEvent( 'calypso_desktop_promo_click', {
			promo_location: this.props.location,
			promo_code: this.props.promoItem.promoCode
		} );
	},

	dismiss: function() {
		this.setState( { show_promo: false } );
		this.props.saveDismissal();
		this.props.recordTracksEvent( 'calypso_desktop_promo_dismiss', {
			promo_location: this.props.location,
			promo_code: this.props.promoItem.promoCode,
		} );
	},

	render: function() {
		if ( ! this.state.show_promo ) {
			return null;
		}

		const { location, translate, getPromoLink } = this.props;
		const { promoItem: { promoCode, message } } = this.props;

		return (
			<div className="app-promo">
				<span tabIndex="0" className="app-promo__dismiss" onClick={ this.dismiss } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="app-promo__screen-reader-text">
						{ translate( 'Dismiss' ) }
					</span>
				</span>
				<a
					onClick={ this.recordClickEvent }
					className="app-promo__link"
					title="Try the desktop app!"
					href={ getPromoLink( location, promoCode ) }
					target="_blank"
					rel="noopener noreferrer"
				>
					<img
						className="app-promo__icon"
						src="/calypso/images/reader/promo-app-icon.png"
						width="32"
						height="32"
						alt="WordPress Desktop Icon"
					/>
					{ message }
				</a>
			</div>
		);
	}
} );

AppPromo.defaultProps = {
	promoItem: getRandomPromo(),
	getPromoLink,
	translate: identity,
	recordTracksEvent: noop,
	saveDismissal: ( ) => store.set( 'desktop_promo_disabled', true )
};

const mapDispatchToProps = ( dispatch ) => {
	return {
		recordTracksEvent: ( event, properties ) => {
			dispatch( recordTracksEvent( event, properties ) );
		}
	};
};

export default connect( null, mapDispatchToProps )( localize( AppPromo ) ) ;
