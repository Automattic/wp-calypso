/**
 * TitlePicker — renders title suggestions in the chat sidebar.
 *
 * Displayed when the backend ability returns a Tool_Call_Result with
 * tool_id 'wpcom__select_title'. The user clicks a title card to apply it.
 */

/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Props for the TitlePicker component.
 */
interface TitleOption {
	title: string;
	explanation?: string;
}

interface TitlePickerProps {
	titles: TitleOption[];
	onComplete?: () => void;
}

/**
 * TitlePicker component for the chat sidebar.
 *
 * Renders title suggestions as clickable cards. Clicking a card selects it,
 * then the user confirms with "Use this title" to update the post.
 * @param {TitlePickerProps} props - Component props.
 * @returns {import('react').ReactElement} The rendered component.
 */
export default function TitlePicker( { titles, onComplete }: TitlePickerProps ) {
	const [ selected, setSelected ] = useState< string | null >( null );
	const [ applied, setApplied ] = useState( false );
	const { editPost } = useDispatch( 'core/editor' );

	const handleApply = useCallback( () => {
		if ( ! selected ) {
			return;
		}
		editPost( { title: selected } );
		setApplied( true );
		onComplete?.();
	}, [ editPost, selected, onComplete ] );

	if ( applied ) {
		return (
			<div className="jetpack-ai-title-picker">
				<p className="jetpack-ai-title-picker__applied">{ __( 'Title updated!', 'jetpack' ) }</p>
			</div>
		);
	}

	return (
		<div className="jetpack-ai-title-picker">
			<p className="jetpack-ai-title-picker__intro">
				{ __( 'Choose a title for your post:', 'jetpack' ) }
			</p>
			<div className="jetpack-ai-title-picker__options">
				{ titles.map( ( option ) => (
					<button
						key={ option.title }
						type="button"
						className={ `jetpack-ai-title-picker__card${
							option.title === selected ? ' is-selected' : ''
						}` }
						onClick={ () => setSelected( option.title ) }
					>
						<span className="jetpack-ai-title-picker__card-title">{ option.title }</span>
						{ option.explanation && (
							<span className="jetpack-ai-title-picker__card-explanation">
								{ option.explanation }
							</span>
						) }
					</button>
				) ) }
			</div>
			{ selected && (
				<div className="jetpack-ai-title-picker__actions">
					<Button variant="primary" onClick={ handleApply }>
						{ __( 'Use this title', 'jetpack' ) }
					</Button>
				</div>
			) }
		</div>
	);
}
