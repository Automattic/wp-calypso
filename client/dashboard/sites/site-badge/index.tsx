import { Badge } from '@automattic/ui';
import { __ } from '@wordpress/i18n';

export type EnvironmentType = 'production' | 'staging';

interface SiteBadgeProps {
	environmentType: EnvironmentType;
}

const SiteBadge = ( { environmentType }: SiteBadgeProps ) => {
	const getBadgeColor = (): string => {
		return environmentType === 'staging' ? '#f0c930' : '#dcdcde';
	};

	const getBadgeText = (): string => {
		return environmentType === 'staging' ? __( 'Staging' ) : __( 'Production' );
	};

	return <Badge style={ { backgroundColor: getBadgeColor() } }>{ getBadgeText() }</Badge>;
};

export default SiteBadge;
