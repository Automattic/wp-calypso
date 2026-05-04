import { Icon, plus } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useComposer, type ComposerEntryPoint } from '../composer-provider';
import type { AtmosphereConnection } from '@automattic/api-core';

interface Props {
	connection: AtmosphereConnection;
	entryPoint: Exclude< ComposerEntryPoint, 'fab' >;
	avatar?: string | null;
	className?: string;
}

export function TimelineComposePill( { connection, entryPoint, avatar, className }: Props ) {
	const translate = useTranslate();
	const { openComposer } = useComposer();
	const placeholder = translate( 'What’s up?' ) as string;
	// `connection.avatar` always comes from the list endpoint, which omits
	// avatars; the real URL is supplied by callers from useConnectionQuery.
	const avatarUrl = avatar ?? connection.avatar;

	return (
		<button
			type="button"
			className={ clsx( 'atmosphere-compose-pill', className ) }
			aria-label={ placeholder }
			onClick={ () => openComposer( { kind: 'standalone', entry_point: entryPoint } ) }
		>
			{ avatarUrl ? (
				<img
					className="atmosphere-compose-pill__avatar"
					src={ avatarUrl }
					alt=""
					aria-hidden="true"
				/>
			) : (
				<span
					className="atmosphere-compose-pill__avatar atmosphere-compose-pill__avatar--placeholder"
					aria-hidden="true"
				/>
			) }
			<span className="atmosphere-compose-pill__placeholder">{ placeholder }</span>
			<Icon className="atmosphere-compose-pill__icon" icon={ plus } size={ 18 } />
		</button>
	);
}
