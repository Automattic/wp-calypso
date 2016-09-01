/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Bluehost from './bluehost';
import SiteGround from './siteground';

import SectionHeader from 'components/section-header';
import { cartItems } from 'lib/cart-values';
import upgradesActions from 'lib/upgrades/actions';
import page from 'page';
import {
	saveHostDetails,
} from 'state/sites/guided-transfer/actions';
import {
	isGuidedTransferSavingHostDetails,
	isGuidedTransferAwaitingPurchase,
} from 'state/sites/guided-transfer/selectors';
import {
	getSiteSlug,
} from 'state/sites/selectors';

class HostCredentialsPage extends Component {
	static propTypes = {
		hostSlug: PropTypes.string.isRequired,
	};

	state = { fieldValues: {} };

	setFieldValue = ( fieldName, fieldValue ) => {
		this.setState( { fieldValues: {
			...this.state.fieldValues,
			[ fieldName ]: fieldValue,
		} } );
	}

	onFieldChange = fieldName => e => {
		this.setFieldValue( fieldName, e.target.value );
	}

	redirectToCart = () => {
		upgradesActions.addItem( cartItems.guidedTransferItem() );
		page.redirect( `/checkout/${ this.props.siteSlug }` );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.isAwaitingPurchase ) {
			this.redirectToCart();
		}
	}

	submit = () => {
		const payload = {
			...this.state.fieldValues,
			host_slug: this.props.hostSlug
		};

		this.props.submit( payload );
	}

	getHostForm() {
		const props = {
			onFieldChange: this.onFieldChange,

			fieldValues: this.state.fieldValues,
			hostInfo: this.props.hostInfo,

			submit: this.submit,
			isSubmitting: this.props.isSubmitting,
		};

		switch ( this.props.hostSlug ) {
			case 'bluehost':
				return <Bluehost { ...props } />;
			case 'siteground':
				return <SiteGround { ...props } />;
		}

		return null;
	}

	render() {
		return (
			<div>
				<SectionHeader label={ this.props.translate( 'Account Info' ) } />
				{ this.getHostForm() }
			</div>
		);
	}
}

const mapStateToProps = ( state, { siteId } ) => ( {
	isSubmitting: isGuidedTransferSavingHostDetails( state, siteId ),
	isAwaitingPurchase: isGuidedTransferAwaitingPurchase( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
} );

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	submit: data => dispatch( saveHostDetails( siteId, data ) ),
} );

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( HostCredentialsPage )
);
