/**
 * External dependencies
 */
import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { Icon, chevronRight } from '@wordpress/icons';
import { createInterpolateElement } from '@wordpress/element';
import { useLocalizeUrl } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */

interface Props {
	siteSlug: string;
	source: string;
}

const DomainIOwn: React.FunctionComponent< Props > = ( { siteSlug, source } ) => {
	const localizeUrl = useLocalizeUrl();

	return (
		<label className="domain-picker__suggestion-item contains-link">
			<div className="domain-picker__suggestion-item-name">
				<span className="domain-picker__domain-wrapper with-margin">
					{ createInterpolateElement(
						__( '<strong>Already own a domain?</strong>', __i18n_text_domain__ ),
						{
							strong: <strong />,
						}
					) }
				</span>
				<div>
					<span className="domain-picker__item-tip">
						{ __( "You can use it as your site's address", __i18n_text_domain__ ) }
					</span>
				</div>
			</div>
			<div className="domain-picker__action-link with-underline">
				{ createInterpolateElement(
					__(
						'<strong><use_domain_link>Use a domain I own</use_domain_link></strong>',
						__i18n_text_domain__
					),
					{
						strong: <strong />,
						use_domain_link: (
							<a
								rel="noreferrer"
								href={ localizeUrl(
									`https://wordpress.com/start/new-launch/domains-launch/use-your-domain?siteSlug=${ siteSlug }&source=${ source }`
								) }
							/>
						),
					}
				) }
				<Icon icon={ chevronRight } />
			</div>
		</label>
	);
};

export default DomainIOwn;
