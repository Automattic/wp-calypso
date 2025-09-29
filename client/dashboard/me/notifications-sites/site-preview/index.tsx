import { Site } from '@automattic/api-core';
import { Badge } from '@automattic/ui';
import { __experimentalGrid as Grid, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ExternalLink } from '../../../components/external-link';
import RouterLinkButton from '../../../components/router-link-button';
import { isSitePlanTrial } from '../../../sites/plans';
import { getSiteManagementUrl } from '../../../sites/site-fields';
import SiteIcon from '../../../sites/site-icon';
import { isP2, isStagingSite } from '../../../utils/site-types';

import './index.scss';

const getSiteBadge = ( site: Site ) => {
	if ( isStagingSite( site ) ) {
		return __( 'Staging' );
	}
	if ( isSitePlanTrial( site ) ) {
		return __( 'Trial' );
	}
	if ( isP2( site ) ) {
		return __( 'P2' );
	}
	return null;
};

interface Props {
	site: Site;
}

export const SitePreview = ( { site }: Props ) => {
	const badge = getSiteBadge( site );

	return (
		<Grid columns={ 2 } columnGap={ 12 } rowGap={ 12 } alignment="topLeft" templateColumns="none">
			<SiteIcon site={ site } size={ 44 } />
			<VStack alignment="topLeft" spacing={ 1 }>
				{ site.name !== '' && (
					<RouterLinkButton
						variant="link"
						to={ getSiteManagementUrl( site ) ?? '' }
						disabled={ site.is_deleted }
					>
						{ site.name }
					</RouterLinkButton>
				) }
				<ExternalLink href={ site.URL } disabled={ site.is_deleted } ellipsisMode="auto">
					{ site.URL }
				</ExternalLink>
			</VStack>
			<div style={ { gridColumnStart: 2 } }>{ badge && <Badge>{ badge }</Badge> }</div>
		</Grid>
	);
};
