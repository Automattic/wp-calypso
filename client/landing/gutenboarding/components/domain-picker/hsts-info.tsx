/**
 * External dependencies
 */
import { sprintf } from '@wordpress/i18n';
import React, { FunctionComponent, useState, useRef } from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Button, Popover, SVG, Path, ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { HTTPS_SSL } from 'lib/url/support';

interface Props {
	tld: string;
}

const icon = (
	<SVG width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
		<Path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M15.4995 8C15.4995 3.85775 12.1418 0.5 7.99951 0.5C3.85726 0.5 0.499512 3.85775 0.499512 8C0.499512 12.1422 3.85726 15.5 7.99951 15.5C12.1418 15.5 15.4995 12.1422 15.4995 8ZM7.99883 2.00059C4.69133 2.00059 1.99883 4.69309 1.99883 8.00059C1.99883 11.3081 4.69133 14.0006 7.99883 14.0006C11.3063 14.0006 13.9988 11.3081 13.9988 8.00059C13.9988 4.69309 11.3063 2.00059 7.99883 2.00059ZM7.24941 5.75059H8.74941V4.25059H7.24941V5.75059ZM7.24941 7.25029H8.74941V11.7503H7.24941V7.25029Z"
			fill="currentColor"
		/>
	</SVG>
);

const HstsInfo: FunctionComponent< Props > = ( { tld } ) => {
	const { __ } = useI18n();
	const [ isPopoverVisible, setPopoverVisibility ] = useState( false );
	const buttonRef = useRef();

	return (
		<>
			<Button
				aria-label={ __( 'Additional information about this domain ending.' ) }
				className="domain-picker__hsts-button"
				icon={ icon }
				isSmall
				isTertiary
				onClick={ () => {
					setPopoverVisibility( ! isPopoverVisible );
				} }
				ref={ buttonRef }
			>
				{ isPopoverVisible && (
					<Popover position="center right" noArrow={ false }>
						{ createInterpolateElement(
							sprintf(
								/* translators: %s: domain TLD such as .dev. */
								__(
									'All domains ending in <strong>%s</strong> require an SSL certificate to host a website. When you host this domain at WordPress.com an SSL certificate is included.'
								),
								tld
							),
							{ strong: <strong /> }
						) }
						<ExternalLink href={ HTTPS_SSL }>{ __( 'Learn more.' ) }</ExternalLink>
					</Popover>
				) }
			</Button>
		</>
	);
};

export default HstsInfo;
