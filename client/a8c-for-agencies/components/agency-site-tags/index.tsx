import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import AgencySiteTag from 'calypso/a8c-for-agencies/components/agency-site-tag';
import FormTextInput from 'calypso/components/forms/form-text-input';

interface Props {
	tags: string[];
	onAddTags: ( newTags: string[] ) => void;
	onRemoveTag: ( removeTag: string ) => void;
}

export default function AgencySiteTags( { tags, onAddTags, onRemoveTag }: Props ) {
	const translate = useTranslate();
	const [ tagsInput, setTagsInput ] = useState( '' );

	const handleAddTags = () => {
		setTagsInput( '' );
		onAddTags( tagsInput.split( ',' ).map( ( s ) => s.trim() ) );
	};

	return (
		<div className="agency-site-tags">
			<Card className="agency-site-tags__tag-controls">
				<FormTextInput
					onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
						setTagsInput( e.target.value )
					}
					value={ tagsInput }
					placeholder={ translate( 'Add tags here (separate by commas)' ) }
				/>
				<Button primary compact onClick={ handleAddTags }>
					{ translate( 'Add' ) }
				</Button>
			</Card>
			<Card className="agency-site-tags__tag-list">
				{ tags.map( ( tag ) => (
					<AgencySiteTag key={ tag } tag={ tag } onRemoveTag={ onRemoveTag } />
				) ) }
			</Card>
		</div>
	);
}
