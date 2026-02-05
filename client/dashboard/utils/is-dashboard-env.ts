import config from '@automattic/calypso-config';

export default function isDashboardEnv( variant = '' ): boolean {
	const env = config( 'env_id' ) as string;
	return env.startsWith( `dashboard-${ variant }` );
}
