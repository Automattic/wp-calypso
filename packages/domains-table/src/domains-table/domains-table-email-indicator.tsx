import { LoadingPlaceholder } from '@automattic/components';
import { PartialDomainData } from '@automattic/data-stores';
import { useI18n } from '@wordpress/react-i18n';
//eslint-disable-next-line no-restricted-imports
import { useGetMailboxes } from 'calypso/data/emails/use-get-mailboxes';

export const DomainsTableEmailIndicator = ( {
	domain,
	siteSlug,
}: {
	domain: PartialDomainData;
	siteSlug?: string;
} ) => {
	const { __ } = useI18n();
	const { data: mailboxes = [], isLoading } = useGetMailboxes( domain.blog_id, {
		retry: 2,
	} );

	if ( isLoading || ! siteSlug ) {
		return <LoadingPlaceholder style={ { width: '50%' } } />;
	}

	if ( mailboxes.length === 0 ) {
		return (
			<a className="add-email-button" href={ `/email/${ domain.domain }/manage/${ siteSlug }` }>
				+ { __( 'Add email ' ) }
			</a>
		);
	}

	return (
		<>
			{ __( 'Email ' ) } { mailboxes.length }
		</>
	);
};
