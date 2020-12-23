/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { ArrowButton } from '@automattic/onboarding';

/**
 * Internal dependencies
 */

interface Props {
	onClick: () => void;
}

const UseYourDomainItem: React.FunctionComponent< Props > = ( { onClick } ) => {
	return (
		<label className="domain-picker__suggestion-item contains-link">
			<div className="domain-picker__suggestion-item-name">
				<span className="domain-picker__domain-wrapper with-margin with-bold-text">
					{ __( 'Already own a domain?', __i18n_text_domain__ ) }
				</span>
				<div>
					<span className="domain-picker__item-tip">
						{ __( "You can use it as your site's address", __i18n_text_domain__ ) }
					</span>
				</div>
			</div>
			<ArrowButton arrow="right" onClick={ onClick }>
				{ __( 'Use a domain I own', __i18n_text_domain__ ) }
			</ArrowButton>
		</label>
	);
};

export default UseYourDomainItem;
