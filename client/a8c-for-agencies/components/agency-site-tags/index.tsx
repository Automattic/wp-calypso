import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { KeyboardEvent, useState } from 'react';
import AgencySiteTag from 'calypso/a8c-for-agencies/components/agency-site-tag';
import FormTextInput from 'calypso/components/forms/form-text-input';
import './style.scss';

interface Props {
	tags: string[];
	isLoading: boolean;
	onAddTags: ( newTags: string[] ) => void;
	onRemoveTag: ( removeTag: string ) => void;
}

export default function AgencySiteTags( { tags, isLoading, onAddTags, onRemoveTag }: Props ) {
	const translate = useTranslate();
	const [ tagsInput, setTagsInput ] = useState( '' );

	const handleAddTags = () => {
		onAddTags( tagsInput.split( ',' ).map( ( s ) => s.trim() ) );
		setTagsInput( '' );
	};

	const handleEnterKeyPress = ( event: KeyboardEvent ) => {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			onAddTags( tagsInput.split( ',' ).map( ( s ) => s.trim() ) );
			setTagsInput( '' );
		}
	};

	const isTagsSubmitDisabled = tagsInput === '' || ! tagsInput;

	return (
		<div className="agency-site-tags">
			<p>
				{ translate(
					'Add tags to categorize your sites and easily filter through them on your Sites dashboard.'
				) }
			</p>
			<Card className="agency-site-tags__controls">
				<FormTextInput
					disabled={ isLoading }
					className="agency-site-tags__input"
					onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) =>
						setTagsInput( e.target.value )
					}
					onKeyDown={ handleEnterKeyPress }
					value={ tagsInput }
					placeholder={ translate( 'Add tags here (separate by commas)' ) }
				/>
				<Button
					primary
					compact
					busy={ isLoading }
					disabled={ isTagsSubmitDisabled }
					onClick={ handleAddTags }
					className="agency-site-tags__button"
				>
					{ translate( 'Add' ) }
				</Button>
			</Card>
			{ tags.length ? (
				<Card tagName="ul" className="agency-site-tags__list">
					{ tags.map( ( tag ) => (
						<li>
							<AgencySiteTag key={ tag } tag={ tag } onRemoveTag={ onRemoveTag } />
						</li>
					) ) }
				</Card>
			) : null }
		</div>
	);
}
