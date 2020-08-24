/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { keys } from 'lodash';

/**
 * Internal dependencies
 */
import ShareButton from '../';
import services from '../services';

export default class ShareButtonExample extends PureComponent {
	static displayName = 'ShareButton';

	render() {
		return (
			<div>
				<div>
					{ keys( services ).map( ( service ) => (
						<ShareButton
							key={ service }
							size={ 48 }
							url="https://wordpress.com"
							title="Share your thoughts and ideas on WordPress.com"
							service={ service }
						/>
					) ) }
				</div>
				<div>
					{ keys( services ).map( ( service ) => (
						<ShareButton
							key={ service }
							size={ 48 }
							url="https://wordpress.com"
							title="Share your thoughts and ideas on WordPress.com"
							service={ service }
							color={ false }
						/>
					) ) }
				</div>
			</div>
		);
	}
}
