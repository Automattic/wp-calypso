/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ErrorNotice from './error-notice';
import CompactCard from 'components/card/compact';
import {
	Username,
	Email,
	CreateAccountTip,
	SubmitSection,
	WPOrgURL,
} from './fields';

class SiteGround extends Component {
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
					<ErrorNotice />
					<p>
						{ translate(
							'Please enter your account details. They will be stored securely so that one ' +
							'of our Happiness Engineers can get the transfer going for you.' ) }
					</p>
					<div>
						<Username
							value={ fieldValues.username }
							onChange={ onFieldChange( 'username' ) }
							hostLabel={ hostInfo.label }
							disabled={ isSubmitting }
						/>
						<Email
							value={ fieldValues.email }
							onChange={ onFieldChange( 'email' ) }
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

export default localize( SiteGround );
