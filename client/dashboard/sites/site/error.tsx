import { isInaccessibleJetpackError } from '@automattic/api-core';
import { useParams } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import UnknownError from '../../app/500';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import { InaccessibleJetpackNotice } from './notices';

export default function Error( { error }: { error: Error } ) {
	if ( isInaccessibleJetpackError( error ) ) {
		return <InaccessibleJetpackError error={ error } />;
	}
	return <UnknownError error={ error } />;
}

function InaccessibleJetpackError( { error }: { error: Error } ) {
	const { siteSlug } = useParams( { strict: false } );

	return (
		<PageLayout
			header={
				<PageHeader
					title={ siteSlug }
					actions={
						<RouterLinkButton to="/sites" variant="primary" __next40pxDefaultSize>
							{ __( 'Go to Sites' ) }
						</RouterLinkButton>
					}
				/>
			}
			notices={ <InaccessibleJetpackNotice error={ error } /> }
		></PageLayout>
	);
}
