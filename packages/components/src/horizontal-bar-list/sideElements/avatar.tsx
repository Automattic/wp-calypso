import type { StatsCardAvatarProps } from './../types';

const BASE_CLASS_NAME = 'stats-card-avatar';

const Avatar = ( { url, altName }: StatsCardAvatarProps ) => (
	<span className={ BASE_CLASS_NAME }>
		<img alt={ `${ altName } avatar` } src={ url } className={ `${ BASE_CLASS_NAME }-image` } />
	</span>
);

export default Avatar;
