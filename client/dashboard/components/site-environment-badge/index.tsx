import { Badge } from '@automattic/ui';
import { __ } from '@wordpress/i18n';
import { EnvironmentType } from '../environment';

interface SiteEnvironmentBadgeProps {
	environmentType: EnvironmentType;
}

const SiteEnvironmentBadge = ( { environmentType }: SiteEnvironmentBadgeProps ) => {
	const color = environmentType === 'staging' ? '#dcdcde' : '#b8e6bf';
	const text = environmentType === 'staging' ? __( 'Staging' ) : __( 'Production' );

	return <Badge style={ { backgroundColor: color, borderRadius: '4px' } }>{ text }</Badge>;
};

export default SiteEnvironmentBadge;
