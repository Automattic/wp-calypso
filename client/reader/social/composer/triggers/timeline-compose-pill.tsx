import { Icon, plus } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useComposer, type ComposerEntryPoint } from '../composer-provider';

interface Props {
	/**
	 * The avatar URL to render, or `null` to render the placeholder. The
	 * pill is host-shell-agnostic: the per-protocol panel resolves the
	 * connection's real avatar (e.g. via `useConnectionQuery`) and passes
	 * it in here. The list endpoints both protocols use omit avatars, so
	 * the panel is the right place to hydrate.
	 */
	avatar?: string | null;
	/** The placeholder copy. Defaults to "What's up?". */
	placeholder?: string;
	entryPoint: Exclude< ComposerEntryPoint, 'fab' >;
	className?: string;
}

export function TimelineComposePill( { avatar, placeholder, entryPoint, className }: Props ) {
	const translate = useTranslate();
	const { openComposer } = useComposer();
	const placeholderText = placeholder ?? ( translate( 'What’s up?' ) as string );

	return (
		<button
			type="button"
			className={ clsx( 'social-compose-pill', className ) }
			aria-label={ placeholderText }
			onClick={ () => openComposer( { kind: 'standalone', entry_point: entryPoint } ) }
		>
			{ avatar ? (
				<img className="social-compose-pill__avatar" src={ avatar } alt="" aria-hidden="true" />
			) : (
				<span
					className="social-compose-pill__avatar social-compose-pill__avatar--placeholder"
					aria-hidden="true"
				/>
			) }
			<span className="social-compose-pill__placeholder">{ placeholderText }</span>
			<Icon className="social-compose-pill__icon" icon={ plus } size={ 18 } />
		</button>
	);
}
