import { __ } from '@wordpress/i18n';
import type { SiteActivityLog } from '@automattic/api-core';

type ActivityActorProps = {
	actor?: SiteActivityLog[ 'actor' ];
};

export function ActivityActor( { actor }: ActivityActorProps ) {
	const name = actor?.name?.trim();
	return <span>{ name || __( 'Unknown' ) }</span>;
}
