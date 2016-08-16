/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import {
	Username,
	Email,
	CreateAccountTip,
	SubmitSection,
	DestinationURL,
} from './fields';

class SiteGround extends Component {
	render() {
		const {
			hostInfo,
			translate,
			fieldValues,
			onFieldChange,
		} = this.props;

		return (
			<div>
				<CompactCard>
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
						/>
						<Email
							value={ fieldValues.email }
							onChange={ onFieldChange( 'email' ) }
							hostLabel={ hostInfo.label }
						/>
					</div>
					<CreateAccountTip
						hostLabel={ hostInfo.label }
						hostUrl={ hostInfo.url } />
					<DestinationURL
						value={ fieldValues.wporg_url }
						onChange={ onFieldChange( 'wporg_url' ) }
					/>
				</CompactCard>
				<SubmitSection submit={ this.props.submit } />
			</div>
		);
	}
}

SiteGround.propTypes = {
	hostInfo: PropTypes.shape( {
		label: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired
	} ).isRequired
};

export default localize( SiteGround );
