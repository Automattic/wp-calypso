import { Title, SubTitle } from '@automattic/onboarding';
import { ExternalLink } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { FunctionComponent, useEffect } from 'react';
import { localizeUrl } from 'calypso/lib/i18n-utils/localize-url';
import Link from '../../components/link';
import { SITE_STORE } from '../../stores/site';
import type { LocationDescriptor } from 'history';

import './style.scss';

interface Props {
	linkTo: string | LocationDescriptor;
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
