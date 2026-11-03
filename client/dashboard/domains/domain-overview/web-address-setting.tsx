import { setWwwPrimaryDomainMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { RadioControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { getAuthority } from '@wordpress/url';
import { useAnalytics } from '../../app/analytics';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../components/card';
import type { Domain, Site } from '@automattic/api-core';

const ROOT = 'root';
const WWW = 'www';

export default function DomainWebAddressSetting( {
	domain,
	site,
	isDisabled,
}: {
	domain: Domain;
	site: Site;
	isDisabled?: boolean;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const wwwDomain = `www.${ domain.domain }`;
	const isWwwPrimary = domain.primary_is_www ?? getAuthority( site.URL ) === wwwDomain;

	const { createSuccessNotice } = useDispatch( noticesStore );

	const { mutate, isPending, variables } = useMutation(
		withSnackbar( setWwwPrimaryDomainMutation(), {
			error: { source: 'server' },
		} )
	);

	const selected = ( isPending ? variables?.enabled : isWwwPrimary ) ? WWW : ROOT;

	const handleChange = ( value: string ) => {
		const enabled = value === WWW;
		if ( enabled === isWwwPrimary ) {
			return;
		}

		recordTracksEvent( 'calypso_dashboard_domain_settings_web_address_change', {
			domain: domain.domain,
			www: enabled,
		} );

		mutate(
			{ siteId: site.ID, domain: domain.domain, enabled },
			{
				onSuccess: () => {
					createSuccessNotice(
						sprintf(
							/* translators: %s is the domain name */
							__( '%s is now the primary site address.' ),
							enabled ? wwwDomain : domain.domain
						),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	return (
		<Card>
			<CardBody>
				<RadioControl
					label={ __( 'Web address' ) }
					selected={ selected }
					disabled={ isDisabled || isPending }
					options={ [
						{ label: domain.domain, value: ROOT },
						{
							label: wwwDomain,
							value: WWW,
							description: __(
								'Pick this if people already know your site at the www address, for example after moving it here from another host.'
							),
						},
					] }
					onChange={ handleChange }
				/>
			</CardBody>
		</Card>
	);
}
