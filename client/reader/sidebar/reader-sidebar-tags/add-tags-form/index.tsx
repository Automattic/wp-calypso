import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useForm } from 'react-hook-form';
import './style.scss';

interface AddTagFormProps {
	onAction: ( tag: string ) => void;
}

export const AddTagForm = ( { onAction }: AddTagFormProps ) => {
	const translate = useTranslate();
	const form = useForm( {
		defaultValues: {
			tag: '',
		},
		mode: 'onChange',
	} );

	const handleSubmit = ( data: { tag: string } ) => {
		onAction( data.tag );
		form.reset();
	};
	const { isValid } = form.formState;

	return (
		<form onSubmit={ form.handleSubmit( handleSubmit ) } className="add-tags-form">
			<input
				aria-label={ translate( 'Add a tag' ) }
				className="form-text-input add-tags-form__input"
				placeholder={ translate( 'Add a tag' ) }
				{ ...form.register( 'tag', { required: true, minLength: 2 } ) }
			/>
			<Button
				className="add-tags-form__button"
				variant="primary"
				accessibleWhenDisabled
				name="add-tag"
				disabled={ ! isValid }
				type="submit"
			>
				{ translate( 'Add' ) }
			</Button>
		</form>
	);
};
