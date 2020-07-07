// eslint-disable-next-line wpcalypso/import-docblock
import { registerBlockType } from '@wordpress/blocks';
import { RichText } from '@wordpress/block-editor';
import Tiers from './tiers/tiers';

registerBlockType( 'widgets/janitorial-state-widget', {
	title: 'Janitorial State Widget',
	icon: 'smiley',
	category: 'widgets',
	description: 'Display a widget to track the state of janitorial queues.',
	attributes: {
		title: {
			type: 'array',
			source: 'children',
			selector: 'h2',
		},
		tiers: {
			type: 'array',
			default: [],
		},
		selected: {
			type: 'string',
		},
		id: {
			type: 'integer',
			default: -1,
		},
		isPreview: {
			type: 'boolean',
			default: false,
		},
	},
	example: {
		attributes: {
			title: 'Janitorial State Widget',
			tiers: [
				{
					name: 'Tier 1 ( 8 issues )',
				},
				{
					name: 'Tier 2 ( 5 issues )',
				},
				{
					name: 'Tier 3 ( 3 issues )',
				},
				{
					name: 'Zendesk',
				},
			],
			selected: 'Tier 2 ( 5 issues )',
			id: 1,
			isPreview: true,
		},
	},
	edit: ( props ) => {
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
	},
	save: ( props ) => {
		const {
			attributes: { title, tiers, id },
		} = props;

		const dataProps = {
			'data-tiers': JSON.stringify( tiers ),
			'data-id': id,
		};

		return (
			<div>
				<RichText.Content tagName="h2" value={ title } />
				<div className="wp-block-janitorial-state-widget-main-container" { ...dataProps }>
					{ ' ' }
				</div>
			</div>
		);
	},
} );
