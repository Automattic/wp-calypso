/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { Username, Password, CreateAccountTip, SubmitSection, WPOrgURL } from './fields';
import CompactCard from 'components/card/compact';

class Bluehost extends Component {
	static propTypes = {
		hostInfo: PropTypes.shape( {
			label: PropTypes.string.isRequired,
			url: PropTypes.string.isRequired
		} ).isRequired
	};

	render() {
		const {
			hostInfo,
			translate,
			fieldValues,
			onFieldChange,
			isSubmitting,
		} = this.props;

		return (
			<div>
				<CompactCard>
					<p>
						{ translate(
							'Please enter your credentials. They will be stored securely so that one ' +
							'of our Happiness Engineers can get the transfer going for you.' ) }
					</p>
					<div>
						<Username
							value={ fieldValues.username }
							onChange={ onFieldChange( 'username' ) }
							hostLabel={ hostInfo.label }
							disabled={ isSubmitting }
						/>
						<Password
							value={ fieldValues.password }
							onChange={ onFieldChange( 'password' ) }
							hostLabel={ hostInfo.label }
							disabled={ isSubmitting }
						/>
					</div>
					<CreateAccountTip
						hostLabel={ hostInfo.label }
						hostUrl={ hostInfo.url }
					/>
					<WPOrgURL
						value={ fieldValues.wporg_url }
						onChange={ onFieldChange( 'wporg_url' ) }
						disabled={ isSubmitting }
					/>
				</CompactCard>
				<SubmitSection
					submit={ this.props.submit }
					isSubmitting={ isSubmitting }
				/>
			</div>
		);
	}
}

export default localize( Bluehost );
