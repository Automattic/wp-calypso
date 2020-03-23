/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import { Email, Password, CreateAccountTip, SubmitSection, WPOrgURL } from './fields';

class Pressable extends Component {
	static propTypes = {
		hostInfo: PropTypes.shape( {
			label: PropTypes.string.isRequired,
			url: PropTypes.string.isRequired,
		} ).isRequired,
	};

	render() {
		const { hostInfo, translate, fieldValues, onFieldChange, isSubmitting, submit } = this.props;

		return (
			<div>
				<CompactCard>
					<p>
						{ translate(
							'Please enter your account details. They will be stored securely so that one ' +
								'of our Happiness Engineers can get the transfer going for you.'
						) }
					</p>
					<div>
						<Email
							value={ fieldValues.email }
							onChange={ onFieldChange( 'email' ) }
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
					<CreateAccountTip hostLabel={ hostInfo.label } hostUrl={ hostInfo.url } />
					<WPOrgURL
						value={ fieldValues.wporg_url }
						onChange={ onFieldChange( 'wporg_url' ) }
						disabled={ isSubmitting }
					/>
				</CompactCard>
				<SubmitSection submit={ submit } isSubmitting={ isSubmitting } />
			</div>
		);
	}
}

export default localize( Pressable );
