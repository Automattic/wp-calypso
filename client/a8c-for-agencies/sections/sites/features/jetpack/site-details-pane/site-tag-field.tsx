import { useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import './site-tag-field.scss';
import FormTextInput from 'calypso/components/forms/form-text-input';

interface Props {
	onSaveNewTag: Function;
}

export default function SiteTagField( { onSaveNewTag }: Props ) {
	const translate = useTranslate();
	const [ isEditing, setIsEditing ] = useState( false );
	const [ tagLabel, setTagLabel ] = useState( '' );

	const toggleEdit = () => {
		if ( isEditing ) {
			setIsEditing( false );
		} else {
			setIsEditing( true );
		}
	};

	const handleSave = () => {
		onSaveNewTag( tagLabel );
		setIsEditing( false );
	};

	return (
		<div className="site-tag-field">
			{ isEditing && (
				<>
					<FormTextInput
						onChange={ ( e ) => setTagLabel( e.target.value ) }
						className="site-tag-field__text-input"
					/>
					<a className="site-tag-field__action" onClick={ handleSave }>
						{ translate( 'Save' ) }
					</a>
					<a className="site-tag-field__action" onClick={ toggleEdit }>
						{ translate( 'Cancel' ) }
					</a>
				</>
			) }
			{ ! isEditing && (
				<a className="site-tag-field__action" onClick={ toggleEdit }>
					{ translate( 'Add tag' ) }
				</a>
			) }
		</div>
	);
}
