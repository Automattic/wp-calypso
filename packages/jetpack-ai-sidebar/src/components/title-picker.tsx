/**
 * TitlePicker — renders title suggestions in the chat sidebar.
 *
 * Displayed when the orchestrator renders a show-component response with
 * data.type set to 'title-picker'.
 * Clicking a title card applies it to the post immediately. The picker
 * stays visible so users can try different titles in real time; the
 * currently-applied option is highlighted.
 *
 * Response feedback (thumbs up/down) is provided by Agents Manager's
 * native feedback action bar, which attaches to the orchestrator's
 * intro text message (not to the picker itself).
 */

/**
 * External dependencies
 */
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
 * Renders title suggestions as clickable cards. Clicking a card updates the
 * post title immediately; the picker stays visible so the user can click
 * through options to try them. The currently-applied title is highlighted.
 * @param {TitlePickerProps} props - Component props.
 * @returns {import('react').ReactElement} The rendered component.
 */
export default function TitlePicker( { titles, onComplete }: TitlePickerProps ) {
	const [ appliedTitle, setAppliedTitle ] = useState< string | null >( null );
	const { editPost } = useDispatch( 'core/editor' );

	const handleApply = useCallback(
		( title: string ) => {
			editPost( { title } );
			setAppliedTitle( title );
			onComplete?.();
		},
		[ editPost, onComplete ]
	);

	return (
		<div className="jetpack-ai-title-picker">
			<p className="jetpack-ai-title-picker__intro">
				{ __( 'Choose a title for your post:', 'jetpack' ) }
			</p>
			<div className="jetpack-ai-title-picker__options">
				{ titles.map( ( option, index ) => {
					const isApplied = option.title === appliedTitle;
					return (
						<button
							key={ `${ option.title }-${ index }` }
							type="button"
							className={ `jetpack-ai-title-picker__card${ isApplied ? ' is-applied' : '' }` }
							onClick={ () => handleApply( option.title ) }
							aria-pressed={ isApplied }
						>
							<span className="jetpack-ai-title-picker__card-title">{ option.title }</span>
						</button>
					);
				} ) }
			</div>
		</div>
	);
}
