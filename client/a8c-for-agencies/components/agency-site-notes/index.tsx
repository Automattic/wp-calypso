import { Gravatar, LoadingPlaceholder } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import useCreateSiteNoteMutation from 'calypso/a8c-for-agencies/sections/sites/site-preview-pane/hooks/use-create-site-note-mutation';
import TextareaAutosize from 'calypso/components/textarea-autosize';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import './style.scss';

interface Props {
	siteId: number;
	notes: any[];
}

export default function AgencySiteNotes( { siteId, notes }: Props ) {
	const translate = useTranslate();
	const notesMutation = useCreateSiteNoteMutation();

	const [ fieldState, setFieldState ] = useState( '' );
	const currentUser = useSelector( getCurrentUser );

	const onFieldChange = ( e: any ) => {
		setFieldState( e.target.value );
	};

	const maybeSubmit = ( e: any ) => {
		if ( 'Enter' === e.key && ! e.shiftKey ) {
			e.preventDefault();
			notesMutation.mutate( { siteId, content: fieldState } );
			setFieldState( '' );
		}
	};

	const noteBlocks = notes.map( ( note ) => {
		const user = {
			name: note.author_name,
			display_name: note.author_name,
			avatar_URL: note.author_gravatar,
		};

		const displayDate = new Date( note.date ).toLocaleDateString( 'en-us', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		} );

		return (
			<div className="agency-site-notes__note-block" key={ note.id }>
				<div className="agency-site-notes__note-block-avatar">
					<Gravatar user={ user } size={ 32 } />
				</div>
				<div className="agency-site-notes__note-block-content">
					<div className="agency-site-notes__note-block-meta">
						<div className="agency-site-notes__note-block-author">{ note.author_name }</div>
						<div className="agency-site-notes__note-block-date">{ displayDate }</div>
					</div>
					<div className="agency-site-notes__note-block-content">{ note.content }</div>
				</div>
			</div>
		);
	} );

	return (
		<div className="agency-site-notes">
			<div className="agency-site-notes__input">
				<div className="agency-site-notes__input-label">{ translate( 'Add new note' ) }</div>
				<div className="agency-site-notes__input-field">
					<Gravatar user={ currentUser } size={ 32 } />
					<TextareaAutosize
						onChange={ onFieldChange }
						onKeyDown={ maybeSubmit }
						value={ fieldState }
					/>
				</div>
			</div>

			{ notesMutation.isPending && (
				<div className="agency-site-notes__note-block">
					<div className="agency-site-notes__note-block-avatar">
						<LoadingPlaceholder style={ { width: '32px', height: '32px', borderRadius: '50%' } } />
					</div>
					<div className="agency-site-notes__note-block-content" style={ { flexGrow: 1 } }>
						<div className="agency-site-notes__note-block-meta">
							<LoadingPlaceholder style={ { height: '21px', maxWidth: '256px' } } />
						</div>
						<div className="agency-site-notes__note-block-content">
							<LoadingPlaceholder style={ { height: '21px' } } />
						</div>
					</div>
				</div>
			) }

			{ noteBlocks }
		</div>
	);
}
