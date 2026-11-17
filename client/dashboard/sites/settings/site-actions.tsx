import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useAuth } from '../../app/auth';
import { ActionList } from '../../components/action-list';
import { SectionHeader } from '../../components/section-header';
import { wpcomLink } from '../../utils/link';
import { canViewSiteActions, canDuplicateSite } from '../features';
import type { Site } from '@automattic/api-core';

const DuplicateSite = ( { site }: { site: Site } ) => {
	return (
		<ActionList.ActionItem
			title={ __( 'Duplicate site' ) }
			description={ __( 'Create a duplicate of this site.' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					href={ addQueryArgs( wpcomLink( '/setup/copy-site' ), {
						sourceSlug: site.slug,
					} ) }
				>
					{ __( 'Duplicate' ) }
				</Button>
			}
		/>
	);
};

export default function SiteActions( { site }: { site: Site } ) {
	const { user } = useAuth();

	if ( ! canViewSiteActions( site ) ) {
		return null;
	}

	const actions = [
		canDuplicateSite( site, user ) && <DuplicateSite key="duplicate-site" site={ site } />,
	].filter( Boolean );

	if ( ! actions.length ) {
		return null;
	}

	return (
		<VStack spacing={ 3 }>
			<SectionHeader title={ __( 'Actions' ) } level={ 3 } />
			<ActionList>{ actions }</ActionList>
		</VStack>
	);
}
