/**
 * PROTOTYPE — proof of concept only.
 *
 * Multi-select answers shown as toggleable cards (or compact chips). An option
 * marked `isOther` expands into a text field when selected, so people can
 * describe what's missing from the list.
 */
import { TextareaControl } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type { ChoiceOption } from '../lib/options';

type Props = {
	options: ChoiceOption[];
	value: string[];
	onChange: ( value: string[] ) => void;
	variant?: 'cards' | 'chips';
	label: string;
	otherText?: string;
	onOtherTextChange?: ( text: string ) => void;
	otherPlaceholder?: string;
};

export default function ChoiceCards( {
	options,
	value,
	onChange,
	variant = 'cards',
	label,
	otherText = '',
	onOtherTextChange,
	otherPlaceholder,
}: Props ) {
	const translate = useTranslate();

	const toggle = ( optionValue: string ) =>
		onChange(
			value.includes( optionValue )
				? value.filter( ( v ) => v !== optionValue )
				: [ ...value, optionValue ]
		);

	return (
		<div
			className={ clsx( 'a4a-choice-cards', `is-${ variant }` ) }
			role="group"
			aria-label={ label }
		>
			{ options.map( ( option ) => {
				const isSelected = value.includes( option.value );
				const isExpanded = !! option.isOther && isSelected && !! onOtherTextChange;

				return (
					<div
						key={ option.value }
						className={ clsx( 'a4a-choice-card-group', { 'is-expanded': isExpanded } ) }
					>
						<button
							type="button"
							className={ clsx( 'a4a-choice-card', { 'is-selected': isSelected } ) }
							aria-pressed={ isSelected }
							aria-expanded={ option.isOther ? isExpanded : undefined }
							onClick={ () => toggle( option.value ) }
						>
							<span className="a4a-choice-card-check" aria-hidden="true">
								{ isSelected && <Icon icon={ check } size={ 16 } /> }
							</span>
							<span className="a4a-choice-card-text">
								<span className="a4a-choice-card-label">{ option.label }</span>
								{ variant === 'cards' && option.description && (
									<span className="a4a-choice-card-description">{ option.description }</span>
								) }
							</span>
						</button>

						{ isExpanded && (
							<div className="a4a-choice-card-other">
								<TextareaControl
									__nextHasNoMarginBottom
									label={ translate( 'Tell us more' ) }
									hideLabelFromVision
									value={ otherText }
									onChange={ onOtherTextChange }
									placeholder={ otherPlaceholder ?? translate( 'Tell us more…' ) }
									rows={ 3 }
									maxLength={ 500 }
									// Focus the field as soon as "Other" is picked.
									// eslint-disable-next-line jsx-a11y/no-autofocus
									autoFocus
								/>
							</div>
						) }
					</div>
				);
			} ) }
		</div>
	);
}
