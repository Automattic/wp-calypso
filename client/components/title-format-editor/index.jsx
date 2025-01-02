import { FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
import clsx from 'clsx';
import { CompositeDecorator, Editor, EditorState, Modifier, SelectionState } from 'draft-js';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	buildSeoTitle,
	isJetpackMinimumVersion,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { fromEditor, mapTokenTitleForEditor, toEditor } from './parser';
import Token from './token';

import 'draft-js/dist/Draft.css';
import './style.scss';

const noop = () => {};
const Chip = ( onClick ) => ( props ) => <Token { ...props } onClick={ onClick } />;

export class TitleFormatEditor extends Component {
	static propTypes = {
		disabled: PropTypes.bool,
		placeholder: PropTypes.string,
		type: PropTypes.object.isRequired,
		tokens: PropTypes.object.isRequired,
		onChange: PropTypes.func.isRequired,
		// Connected props
		titleData: PropTypes.object,
		shouldShowSeoArchiveTitleButton: PropTypes.bool,
	};

	static defaultProps = {
		disabled: false,
		placeholder: '',
	};

	constructor( props ) {
		super( props );

		this.storeEditorReference = ( r ) => ( this.editor = r );
		this.focusEditor = () => this.editor.focus();

		this.updateEditor = this.updateEditor.bind( this );
		this.addToken = this.addToken.bind( this );
		this.removeToken = this.removeToken.bind( this );
		this.renderTokens = this.renderTokens.bind( this );
		this.editorStateFrom = this.editorStateFrom.bind( this );
		this.skipOverTokens = this.skipOverTokens.bind( this );

		this.state = {
			editorState: EditorState.moveSelectionToEnd( this.editorStateFrom( props ) ),
		};
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.disabled && ! nextProps.disabled ) {
			this.setState( {
				editorState: EditorState.moveSelectionToEnd( this.editorStateFrom( nextProps ) ),
			} );
		}
	}

	editorStateFrom( props ) {
		const { disabled } = props;

		return EditorState.createWithContent(
			toEditor( props.titleFormats, props.tokens ),
			new CompositeDecorator( [
				{
					strategy: this.renderTokens,
					component: Chip( disabled ? noop : this.removeToken ),
				},
			] )
		);
	}

	/**
	 * Returns a new editorState that forces
	 * selection to hop over tokens, preventing
	 * navigating the cursor into a token
	 * @param {EditorState} editorState new state of editor after changes
	 * @returns {EditorState} maybe filtered state for editor
	 */
	skipOverTokens( editorState ) {
		const content = editorState.getCurrentContent();
		const selection = editorState.getSelection();

		// okay if we did not move the cursor
		const before = this.state.editorState.getSelection();
		const offset = selection.getFocusOffset();

		if ( before.getFocusKey() === selection.getFocusKey() && before.getFocusOffset() === offset ) {
			return editorState;
		}

		const block = content.getBlockForKey( selection.getFocusKey() );
		const direction = Math.sign( offset - before.getFocusOffset() );
		const entityKey = block.getEntityAt( offset );

		// okay if we are at the edges of the block
		if ( 0 === offset || block.getLength() === offset ) {
			return editorState;
		}

		// okay if we aren't in a token
		if ( ! entityKey ) {
			return editorState;
		}

		// get characters in entity
		const indices = block.getCharacterList().reduce( ( ids, value, key ) => {
			return entityKey === value.entity ? [ ...ids, key ] : ids;
		}, [] );

		// okay if cursor is at the spot
		// right before the token
		const [ firstIndex ] = indices;
		if ( offset === firstIndex ) {
			return editorState;
		}

		const outside =
			direction > 0
				? Math.min( Math.max( ...indices ) + 1, block.getLength() )
				: Math.max( Math.min( ...indices ), 0 );

		return EditorState.forceSelection(
			editorState,
			selection.set( 'anchorOffset', outside ).set( 'focusOffset', outside )
		);
	}

	updateEditor( rawEditorState, { doFocus = false } = {} ) {
		const { onChange, type } = this.props;
		const currentContent = rawEditorState.getCurrentContent();

		// limit to one line
		if ( currentContent.getBlockMap().size > 1 ) {
			return;
		}

		const editorState = this.skipOverTokens( rawEditorState );

		this.setState( { editorState }, () => {
			doFocus && this.focusEditor();
			onChange( type.value, fromEditor( currentContent ) );
		} );
	}

	addToken( title, name ) {
		return () => {
			const { editorState } = this.state;
			const currentSelection = editorState.getSelection();
			const currentContent = editorState.getCurrentContent();

			currentContent.createEntity( 'TOKEN', 'IMMUTABLE', { name } );
			const tokenEntity = currentContent.getLastCreatedEntityKey();

			const contentState = Modifier.replaceText(
				editorState.getCurrentContent(),
				currentSelection,
				mapTokenTitleForEditor( title ),
				null,
				tokenEntity
			);

			this.updateEditor( EditorState.push( editorState, contentState, 'add-token' ), {
				doFocus: true,
			} );
		};
	}

	removeToken( entityKey ) {
		return () => {
			const { editorState } = this.state;
			const currentContent = editorState.getCurrentContent();
			const currentSelection = editorState.getSelection();

			const block = currentContent.getBlockForKey( currentSelection.focusKey );

			// get characters in entity
			const indices = block.getCharacterList().reduce( ( ids, value, key ) => {
				return entityKey === value.entity ? [ ...ids, key ] : ids;
			}, [] );

			const range = SelectionState.createEmpty( block.key )
				.set( 'anchorOffset', Math.min( ...indices ) )
				.set( 'focusOffset', Math.max( ...indices ) );

			const withoutToken = EditorState.push(
				editorState,
				Modifier.removeRange( currentContent, range, 'forward' ),
				'remove-range'
			);

			const selectionBeforeToken = EditorState.forceSelection(
				withoutToken,
				range
					.set( 'anchorOffset', Math.min( ...indices ) )
					.set( 'focusOffset', Math.min( ...indices ) )
			);

			this.updateEditor( selectionBeforeToken );
		};
	}

	renderTokens( contentBlock, callback, contentState ) {
		contentBlock.findEntityRanges( ( character ) => {
			const entity = character.getEntity();

			if ( null === entity ) {
				return false;
			}
			return 'TOKEN' === contentState.getEntity( entity ).getType();
		}, callback );
	}

	render() {
		const { editorState } = this.state;
		const {
			disabled,
			placeholder,
			titleData,
			translate,
			tokens,
			type,
			shouldShowSeoArchiveTitleButton,
		} = this.props;

		const previewText =
			type.value && editorState.getCurrentContent().hasText()
				? buildSeoTitle(
						{ [ type.value ]: fromEditor( editorState.getCurrentContent() ) },
						type.value,
						titleData
				  )
				: '';

		const formattedPreview = previewText ? `${ translate( 'Preview' ) }: ${ previewText }` : '';

		const editorClassNames = clsx( 'title-format-editor', {
			disabled,
		} );

		return (
			<div className={ editorClassNames }>
				<div className="title-format-editor__header">
					<span className="title-format-editor__title">{ type.label }</span>
					{ Object.entries( tokens ).map( ( [ name, title ] ) => {
						if ( 'archives' === type.value ) {
							if ( 'date' === name && shouldShowSeoArchiveTitleButton ) {
								// [date] is still tokenized, but we no longer show the button to insert a [date] on JP >= 10.2
								return null;
							}

							if ( 'archiveTitle' === name && ! shouldShowSeoArchiveTitleButton ) {
								// [archive_title] provides a more generic option than [date] shown on JP >= 10.2
								// which supports non date-based archives.
								return null;
							}
						}

						/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
						return (
							<span
								key={ name }
								className="title-format-editor__button"
								onClick={ disabled ? noop : this.addToken( title, name ) }
							>
								{ title }
							</span>
						);
						/* eslint-enable jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */
					} ) }
				</div>
				<div className="title-format-editor__editor-wrapper">
					<Editor
						ariaLabel={ type.label }
						readOnly={ disabled }
						editorState={ editorState }
						onChange={ disabled ? noop : this.updateEditor }
						placeholder={ placeholder }
						ref={ this.storeEditorReference }
					/>
				</div>
				<div className="title-format-editor__preview">{ formattedPreview }</div>
			</div>
		);
	}
}

const mapStateToProps = ( state, ownProps ) => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const { translate } = ownProps;

	let shouldShowSeoArchiveTitleButton = false;
	if ( isJetpackMinimumVersion( state, siteId, '10.2-alpha' ) ) {
		shouldShowSeoArchiveTitleButton = true;
	} else if (
		! isJetpackSite( state, siteId ) &&
		siteHasFeature( state, siteId, FEATURE_ADVANCED_SEO )
	) {
		// For non-AT Business plan sites which get SEO features.
		shouldShowSeoArchiveTitleButton = true;
	}

	// Add example content for post/page title, tag name and archive title.
	return {
		titleData: {
			site,
			post: { title: translate( 'Example Title' ) },
			tag: translate( 'Example Tag' ),
			date: translate( 'Example Archive Title/Date' ),
			archiveTitle: translate( 'Example Archive Title/Date' ),
		},
		shouldShowSeoArchiveTitleButton,
	};
};

export default localize( connect( mapStateToProps )( TitleFormatEditor ) );
