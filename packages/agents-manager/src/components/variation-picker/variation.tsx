import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import StylesPreview from '../styles-preview';
import type { StyleVariation } from '../styles-preview';
import './style.scss';

interface Props {
	variation: StyleVariation;
	type: 'color' | 'font' | 'button';
	isActive?: boolean;
	onSelect?: ( variation: StyleVariation ) => void;
}

export default function Variation( { variation, type, isActive = false, onSelect }: Props ) {
	const handleSelectVariation = () => {
		onSelect?.( variation );
	};

	const selectOnEnter = ( event: React.KeyboardEvent ) => {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			handleSelectVariation();
		}
	};

	let label = variation?.title;
	if ( typeof variation?.description === 'string' && variation.description ) {
		label = sprintf(
			/* translators: %1$s: variation title. %2$s variation description. */
			__( '%1$s (%2$s)', __i18n_text_domain__ ),
			variation.title,
			variation.description
		);
	}

	return (
		<div
			className={ clsx( 'agents-manager-variation-picker__variation', {
				'is-active': isActive,
			} ) }
			role="button"
			onClick={ handleSelectVariation }
			onKeyDown={ selectOnEnter }
			tabIndex={ 0 }
			aria-label={ label }
			aria-current={ isActive }
		>
			<div className="agents-manager-variation-picker__preview">
				<StylesPreview label={ variation?.title } type={ type } variation={ variation } />
			</div>
		</div>
	);
}
