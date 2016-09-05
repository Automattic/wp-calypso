/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';

import { recordTracksEvent } from 'state/analytics/actions';
import store from 'store';
import userUtils from 'lib/user/utils';
import { isChromeOS } from 'lib/user-agent-utils';
import viewport from 'lib/viewport';
import { localize } from 'i18n-calypso';
import { getRandomPromo, getPromoLink } from './lib/promo-retriever';
import { noop, identity } from 'lodash';

const AppPromo = React.createClass( {

	displayName: 'AppPromo',

	propTypes: {
		location: React.PropTypes.string.isRequired 
	},

	getInitialState: function() {
		let show_promo = true;

		if ( store.get( 'desktop_promo_dismissed' ) ) {
			show_promo = false;
		}

		if ( userUtils.getLocaleSlug() !== 'en' ) {
			show_promo = false;
		}

		if ( viewport.isMobile() ) {
			show_promo = false;
		}

		if ( isChromeOS() ) {
			show_promo = false;
		}

		return {
			promo_item: getRandomPromo(),
			show_promo: show_promo
		};
	},

	componentDidMount: function() {
		// record promo view event
		if ( this.state.show_promo ) {
			this.props.recordTracksEvent( 'calypso_desktop_promo_view', {
				promo_location: this.props.location,
				promo_code: this.state.promo_item.promo_code,
			} );
		}
	},

	recordClickEvent: function() {
		this.props.recordTracksEvent( 'calypso_desktop_promo_click', {
			promo_location: this.props.location,
			promo_code: this.state.promo_item.promo_code
		} );
	},

	dismiss: function() {
		this.setState( { show_promo: false } );

		// store as dismissed
		store.set( 'desktop_promo_dismissed', true );
	},

	render: function() {
		if ( ! this.state.show_promo ) {
			return null;
		}

		const promo_link = getPromoLink( this.props.location, this.state.promo_item.promo_code );
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
					href={ promo_link }
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
