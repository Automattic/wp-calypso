/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import { Username, Password, CreateAccountTip, SubmitSection } from './fields';

class Bluehost extends Component {
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
							'Please enter your credentials. They will be stored securely so that one ' +
							'of our Happiness Engineers can get the transfer going for you.' ) }
					</p>
					<div>
						<Username
							value={ fieldValues.username }
							onChange={ onFieldChange( 'username' ) }
							hostLabel={ hostInfo.label }
						/>
						<Password
							value={ fieldValues.password }
							onChange={ onFieldChange( 'password' ) }
							hostLabel={ hostInfo.label }
						/>
					</div>
					<CreateAccountTip
						hostLabel={ hostInfo.label }
						hostUrl={ hostInfo.url } />
				</CompactCard>
				<SubmitSection submit={ this.props.submit } />
			</div>
		);
	}
}

Bluehost.propTypes = {
	hostInfo: PropTypes.shape( {
		label: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired
	} ).isRequired
};

export default localize( Bluehost );
