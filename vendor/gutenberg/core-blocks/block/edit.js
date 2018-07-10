/**
 * External dependencies
 */
import { noop, partial } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, Fragment, compose } from '@wordpress/element';
import { Placeholder, Spinner, Disabled } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { BlockEdit } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import SharedBlockEditPanel from './edit-panel';
import SharedBlockIndicator from './indicator';

class SharedBlockEdit extends Component {
	constructor( { sharedBlock } ) {
		super( ...arguments );

		this.startEditing = this.startEditing.bind( this );
		this.stopEditing = this.stopEditing.bind( this );
		this.setAttributes = this.setAttributes.bind( this );
		this.setTitle = this.setTitle.bind( this );
		this.save = this.save.bind( this );

		if ( sharedBlock && sharedBlock.isTemporary ) {
			// Start in edit mode when we're working with a newly created shared block
			this.state = {
				isEditing: true,
				title: sharedBlock.title,
				changedAttributes: {},
			};
		} else {
			// Start in preview mode when we're working with an existing shared block
			this.state = {
				isEditing: false,
				title: null,
				changedAttributes: null,
			};
		}
	}

	componentDidMount() {
		if ( ! this.props.sharedBlock ) {
			this.props.fetchSharedBlock();
		}
	}

	startEditing() {
		const { sharedBlock } = this.props;

		this.setState( {
			isEditing: true,
			title: sharedBlock.title,
			changedAttributes: {},
		} );
	}

	stopEditing() {
		this.setState( {
			isEditing: false,
			title: null,
			changedAttributes: null,
		} );
	}

	setAttributes( attributes ) {
		this.setState( ( prevState ) => {
			if ( prevState.changedAttributes !== null ) {
				return { changedAttributes: { ...prevState.changedAttributes, ...attributes } };
			}
		} );
	}

	setTitle( title ) {
		this.setState( { title } );
	}

	save() {
		const { sharedBlock, onUpdateTitle, updateAttributes, block, onSave } = this.props;
		const { title, changedAttributes } = this.state;

		if ( title !== sharedBlock.title ) {
			onUpdateTitle( title );
		}

		updateAttributes( block.uid, changedAttributes );
		onSave();

		this.stopEditing();
	}

	render() {
		const { isSelected, sharedBlock, block, isFetching, isSaving } = this.props;
		const { isEditing, title, changedAttributes } = this.state;

		if ( ! sharedBlock && isFetching ) {
			return <Placeholder><Spinner /></Placeholder>;
		}

		if ( ! sharedBlock || ! block ) {
			return <Placeholder>{ __( 'Block has been deleted or is unavailable.' ) }</Placeholder>;
		}

		let element = (
			<BlockEdit
				{ ...this.props }
				isSelected={ isEditing && isSelected }
				id={ block.uid }
				name={ block.name }
				attributes={ { ...block.attributes, ...changedAttributes } }
				setAttributes={ isEditing ? this.setAttributes : noop }
			/>
		);

		if ( ! isEditing ) {
			element = <Disabled>{ element }</Disabled>;
		}

		return (
			<Fragment>
				{ element }
				{ ( isSelected || isEditing ) && (
					<SharedBlockEditPanel
						isEditing={ isEditing }
						title={ title !== null ? title : sharedBlock.title }
						isSaving={ isSaving && ! sharedBlock.isTemporary }
						onEdit={ this.startEditing }
						onChangeTitle={ this.setTitle }
						onSave={ this.save }
						onCancel={ this.stopEditing }
					/>
				) }
				{ ! isSelected && ! isEditing && <SharedBlockIndicator title={ sharedBlock.title } /> }
			</Fragment>
		);
	}
}

export default compose( [
	withSelect( ( select, ownProps ) => {
		const {
			getSharedBlock,
			isFetchingSharedBlock,
			isSavingSharedBlock,
			getBlock,
		} = select( 'core/editor' );
		const { ref } = ownProps.attributes;
		const sharedBlock = getSharedBlock( ref );

		return {
			sharedBlock,
			isFetching: isFetchingSharedBlock( ref ),
			isSaving: isSavingSharedBlock( ref ),
			block: sharedBlock ? getBlock( sharedBlock.uid ) : null,
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const {
			fetchSharedBlocks,
			updateBlockAttributes,
			updateSharedBlockTitle,
			saveSharedBlock,
		} = dispatch( 'core/editor' );
		const { ref } = ownProps.attributes;

		return {
			fetchSharedBlock: partial( fetchSharedBlocks, ref ),
			updateAttributes: updateBlockAttributes,
			onUpdateTitle: partial( updateSharedBlockTitle, ref ),
			onSave: partial( saveSharedBlock, ref ),
		};
	} ),
] )( SharedBlockEdit );
