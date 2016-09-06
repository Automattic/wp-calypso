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

const AppPromo = React.createClass( {

	displayName: 'AppPromo',

	propTypes: {
		location: React.PropTypes.string.isRequired
	},

	getInitialState: function() {
		return {
			promo_item: getRandomPromo(),
			show_promo: true
		};
	},

	componentDidMount: function() {
		// record promo view event
		this.props.recordTracksEvent( 'calypso_desktop_promo_view', {
			promo_location: this.props.location,
			promo_code: this.state.promo_item.promo_code,
		} );
	},

	recordClickEvent: function() {
		this.props.recordTracksEvent( 'calypso_desktop_promo_click', {
			promo_location: this.props.location,
			promo_code: this.state.promo_item.promo_code
		} );
	},

	dismiss: function() {
		this.setState( { show_promo: false } );
		store.set( 'desktop_promo_disabled', true );
	},

	render: function() {
		if ( ! this.state.show_promo ) {
			return null;
		}

		const promoLink = getPromoLink( this.props.location, this.state.promo_item.promo_code );
		return (
			<div className="app-promo">
				<span tabIndex="0" className="app-promo__dismiss" onClick={ this.dismiss } >
					<Gridicon icon="cross" size={ 24 } />
					<span className="app-promo__screen-reader-text">
						{ this.props.translate( 'Dismiss' ) }
					</span>
				</span>
				<a
					onClick={ this.recordClickEvent }
					className="app-promo__link"
					title="Try the desktop app!"
					href={ promoLink }
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
					{ this.state.promo_item.message }
				</a>
			</div>
		);
	}
} );

AppPromo.defaultProps = {
	translate: identity,
	recordTracksEvent: noop,
};

const mapDispatchToProps = ( dispatch ) => {
	return {
		recordTracksEvent: ( event, properties ) => {
			dispatch( recordTracksEvent( event, properties ) );
		}
	};
};

export { AppPromo };
export default connect( null, mapDispatchToProps )( localize( AppPromo ) ) ;
