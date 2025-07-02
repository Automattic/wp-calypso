import { Badge } from '@automattic/ui';
import { __ } from '@wordpress/i18n';

export type EnvironmentType = 'production' | 'staging';

interface SiteEnvironmentBadgeProps {
	environmentType: EnvironmentType;
}

const SiteEnvironmentBadge = ( { environmentType }: SiteEnvironmentBadgeProps ) => {
	const badgeColor = environmentType === 'staging' ? '#f0c930' : '#dcdcde';
	const badgeText = environmentType === 'staging' ? __( 'Staging' ) : __( 'Production' );

	return <Badge style={ { backgroundColor: badgeColor } }>{ badgeText }</Badge>;
};

export default SiteEnvironmentBadge;
