/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Bluehost from './bluehost';
import SiteGround from './siteground';
import SectionHeader from 'components/section-header';

class HostCredentialsPage extends Component {
	constructor() {
		super();
		this.state = { fieldValues: { username: 'test' } };
	}

	setFieldValue = ( fieldName, fieldValue ) => {
		this.setState( { fieldValues: {
			...this.state.fieldValues,
			[ fieldName ]: fieldValue,
		} } );
	}

	onFieldChange = fieldName => e => {
		this.setFieldValue( fieldName, e.target.value );
	}

	submit = data => {
		// Future PR: This function will trigger the Redux API call
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

HostCredentialsPage.PropTypes = {
	hostSlug: PropTypes.string.isRequired,
};

export default localize( HostCredentialsPage );
