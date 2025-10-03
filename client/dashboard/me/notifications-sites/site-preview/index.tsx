import { Site } from '@automattic/api-core';
import { Badge } from '@automattic/ui';
import {
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
	ExternalLink,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
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
		<Grid
			className="site-preview"
			columns={ 2 }
			columnGap={ 12 }
			rowGap={ badge ? 12 : 0 }
			alignment="topLeft"
			templateColumns="44px 1fr"
		>
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
				<ExternalLink className="site-preview__url" href={ site.URL }>
					{ site.URL }
				</ExternalLink>
			</VStack>
			<div className="site-preview__badge">{ badge && <Badge>{ badge }</Badge> }</div>
		</Grid>
	);
};
