import { Site } from '@automattic/api-core';
import { Badge } from '@automattic/ui';
import {
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { chevronUp } from '@wordpress/icons';
import clsx from 'clsx';
import { ExternalLink } from '../../../components/external-link';
import RouterLinkButton from '../../../components/router-link-button';
import { isSitePlanTrial } from '../../../sites/plans';
import { getSiteManagementUrl } from '../../../sites/site-fields';
import SiteIconComponent from '../../../sites/site-icon';
import { isP2, isStagingSite } from '../../../utils/site-types';
import { useSiteNotificationSettingsContext } from './context';

import './index.scss';

const SiteIcon = () => {
	const site = useSiteNotificationSettingsContext();

	if ( ! site ) {
		return null;
	}
	return <SiteIconComponent site={ site } size={ 44 } />;
};

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
	isCollapsed: boolean;
	onCollapsedChange: ( collapsed: boolean ) => void;
}
export const SiteNotificationSettings = ( { isCollapsed, onCollapsedChange }: Props ) => {
	const site = useSiteNotificationSettingsContext();

	if ( ! site ) {
		return null;
	}
	const badge = getSiteBadge( site );

	const toggleCollapsed = () => {
		onCollapsedChange( ! isCollapsed );
	};

	return (
		<HStack>
			<Grid columns={ 2 } columnGap={ 12 } rowGap={ 12 } alignment="topLeft" templateColumns="none">
				<SiteIcon />
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
			<Button
				icon={ chevronUp }
				className={ clsx( 'site-notification-settings__toggle', { collapsed: isCollapsed } ) }
				variant="tertiary"
				onClick={ toggleCollapsed }
			/>
		</HStack>
	);
};
