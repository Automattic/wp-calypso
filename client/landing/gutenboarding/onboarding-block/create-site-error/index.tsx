/**
 * External dependencies
 */
import { createInterpolateElement } from '@wordpress/element';
import { ExternalLink } from '@wordpress/components';
import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import Link from '../../components/link';
import { localizeUrl } from 'calypso/lib/i18n-utils';
import { SITE_STORE } from '../../stores/site';
import { Title, SubTitle } from '@automattic/onboarding';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	linkTo: string;
}

const CreateSiteError: FunctionComponent< Props > = ( { linkTo } ) => {
	const { __ } = useI18n();

	const { resetNewSiteFailed } = useDispatch( SITE_STORE );

	useEffect( () => resetNewSiteFailed );

	return (
		<div className="create-site-error">
			<Title>{ __( 'Something went wrong…' ) }</Title>
			<SubTitle>
				{ createInterpolateElement(
					__(
						'Please go back and try again. If the problem continues, <link_to_support>please contact our support team.</link_to_support>'
					),
					{
						link_to_support: (
							<ExternalLink href={ localizeUrl( 'https://wordpress.com/support/contact/' ) } />
						),
					}
				) }
			</SubTitle>
			<div className="create-site-error__links">
				<Link isPrimary to={ linkTo }>
					{ __( 'Go Back' ) }
				</Link>
			</div>
		</div>
	);
};

export default CreateSiteError;
