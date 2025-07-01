import { Badge } from '@automattic/ui';
import { __ } from '@wordpress/i18n';

export type EnvironmentType = 'production' | 'staging';

interface SiteBadgeProps {
	environmentType: EnvironmentType;
}

/**
 * Site environment badge component that displays either "Staging" or "Production"
 * with appropriate styling based on the environment type.
 * @param {SiteBadgeProps} props - Component props
 */
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
