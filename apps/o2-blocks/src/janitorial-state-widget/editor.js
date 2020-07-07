/**
 * External dependencies
 */
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import Tiers from './components/tiers/tiers';

const edit = ( props ) => {
	const {
		attributes: { title, tiers, id },
		setAttributes,
	} = props;

	let blockId = id;
	if ( -1 === id ) {
		blockId = Date.now();
		setAttributes( { id: blockId } );
	}

	const onChangeTitle = ( value ) => {
		setAttributes( { title: value } );
	};

	const onChangeTiers = ( value ) => {
		setAttributes( { tiers: value } );
	};

	const selectedArray = janitorial_state_widget_block.selected || [];
	let selected = selectedArray[ blockId ] || '';

	// This is just in case we are showuth the example:
	if ( props.attributes.isPreview ) {
		selected = props.attributes.selected;
	}

	return (
		<div className="wp-block-janitorial-state-widget-main-container">
			<RichText
				tagName="h2"
				placeholder={ 'Widget Title' }
				value={ title }
				onChange={ onChangeTitle }
			/>
			<Tiers
				blockId={ blockId }
				tiers={ tiers }
				selected={ selected }
				onChangeTiers={ onChangeTiers }
			/>
		</div>
	);
};

export default edit;
