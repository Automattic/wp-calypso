/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { compose } from 'redux';

/**
 * Internal dependencies
 */
import Bluehost from './bluehost';
import SiteGround from './siteground';

import SectionHeader from 'components/section-header';
import {
	saveHostDetails,
} from 'state/sites/guided-transfer/actions';
import {
	isGuidedTransferSavingHostDetails,
} from 'state/sites/guided-transfer/selectors';

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

	submit = () => {
		this.props.submit( this.state.fieldValues );
	}

	getHostForm() {
		const props = {
			onFieldChange: this.onFieldChange,
			fieldValues: this.state.fieldValues,
			submit: this.submit,
			hostInfo: this.props.hostInfo,
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
	isSaving: isGuidedTransferSavingHostDetails( state, siteId ),
} );

const mapDispatchToProps = ( dispatch, { siteId } ) => ( {
	submit: data => dispatch( saveHostDetails( siteId, data ) ),
} );

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( HostCredentialsPage )
);
