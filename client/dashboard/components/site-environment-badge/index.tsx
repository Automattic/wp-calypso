import { Badge } from '@automattic/ui';
import { __ } from '@wordpress/i18n';
import { EnvironmentType } from '../environment';

interface SiteEnvironmentBadgeProps {
	environmentType: EnvironmentType;
}

const SiteEnvironmentBadge = ( { environmentType }: SiteEnvironmentBadgeProps ) => {
	const text = environmentType === 'staging' ? __( 'Staging' ) : __( 'Production' );

	return <Badge intent={ environmentType === 'staging' ? 'default' : 'success' }>{ text }</Badge>;
};

export default SiteEnvironmentBadge;
