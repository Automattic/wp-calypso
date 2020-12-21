/**
 * External dependencies
 */
import React from 'react';
import IsolatedBlockEditor from 'isolated-editor';
import * as accordion from 'coblocks/src/blocks/accordion';
import * as accordionItem from 'coblocks/src/blocks/accordion/accordion-item';
import * as alert from 'coblocks/src/blocks/alert';
import * as author from 'coblocks/src/blocks/author';
import * as buttons from 'coblocks/src/blocks/buttons';
import * as collage from 'coblocks/src/blocks/gallery-collage';
import * as column from 'coblocks/src/blocks/row/column';
import * as dynamicSeparator from 'coblocks/src/blocks/dynamic-separator';
import * as feature from 'coblocks/src/blocks/features/feature';
import * as features from 'coblocks/src/blocks/features';
import * as form from 'coblocks/src/blocks/form';
import * as fieldDate from 'coblocks/src/blocks/form/fields/date';
import * as fieldEmail from 'coblocks/src/blocks/form/fields/email';
import * as fieldName from 'coblocks/src/blocks/form/fields/name';
import * as fieldRadio from 'coblocks/src/blocks/form/fields/radio';
import * as fieldTelephone from 'coblocks/src/blocks/form/fields/phone';
import * as fieldTextarea from 'coblocks/src/blocks/form/fields/textarea';
import * as fieldText from 'coblocks/src/blocks/form/fields/text';
import * as fieldSelect from 'coblocks/src/blocks/form/fields/select';
import * as fieldSubmitButton from 'coblocks/src/blocks/form/fields/submit-button';
import * as fieldCheckbox from 'coblocks/src/blocks/form/fields/checkbox';
import * as fieldWebsite from 'coblocks/src/blocks/form/fields/website';
import * as fieldHidden from 'coblocks/src/blocks/form/fields/hidden';
import * as gif from 'coblocks/src/blocks/gif';
import * as gist from 'coblocks/src/blocks/gist';
import * as hero from 'coblocks/src/blocks/hero';
import * as highlight from 'coblocks/src/blocks/highlight';
import * as logos from 'coblocks/src/blocks/logos';
import * as map from 'coblocks/src/blocks/map';
import * as masonry from 'coblocks/src/blocks/gallery-masonry';
import * as mediaCard from 'coblocks/src/blocks/media-card';
import * as offset from 'coblocks/src/blocks/gallery-offset';
import * as pricingTable from 'coblocks/src/blocks/pricing-table';
import * as pricingTableItem from 'coblocks/src/blocks/pricing-table/pricing-table-item';
import * as row from 'coblocks/src/blocks/row';
import * as service from 'coblocks/src/blocks/services/service';
import * as services from 'coblocks/src/blocks/services';
import * as shapeDivider from 'coblocks/src/blocks/shape-divider';
import * as stacked from 'coblocks/src/blocks/gallery-stacked';

import { supportsCollections } from 'coblocks/src/utils/block-helpers';
import './form-textarea.scss';

import { registerBlockType } from '@wordpress/blocks';

const registerCoBlockBlock = ( block ) => {
	if ( ! block ) {
		return;
	}

	let { category } = block;

	const { name, settings } = block;

	if ( ! supportsCollections() && ! name.includes( 'gallery' ) ) {
		category = 'coblocks';
	}

	registerBlockType( name, {
		category,
		...settings,
	} );
};

const coblocks = [
	accordion,
	accordionItem,
	alert,
	author,
	buttons,
	collage,
	column,
	dynamicSeparator,
	feature,
	features,
	fieldDate,
	fieldEmail,
	fieldName,
	fieldRadio,
	fieldTelephone,
	fieldTextarea,
	fieldText,
	fieldSelect,
	fieldSubmitButton,
	fieldCheckbox,
	fieldWebsite,
	fieldHidden,
	form,
	gif,
	gist,
	hero,
	highlight,
	logos,
	map,
	masonry,
	mediaCard,
	offset,
	pricingTable,
	pricingTableItem,
	row,
	service,
	services,
	shapeDivider,
	stacked,
];

// some blocks check this for null-safety and others don't 🤷‍♀️
window.coblocksBlockData = {
	form: {
		adminEmail: '',
		emailSubject: '',
		successText: '',
	},
};

coblocks.forEach( registerCoBlockBlock );

const PostCommentFormTextarea = ( props ) => (
	<IsolatedBlockEditor
		onSaveContent={ ( html ) => props.onChange( html ) }
		onError={ console.error }
		settings={ {
			iso: {
				moreMenu: false,
				blocks: {
					allowBlocks: [
						'core/paragraph',
						'core/heading',
						'core/image',
						'core/list',
						'core/code',
						'core/video',
						'core/table',
						'core/quote',
						'core/separator',
						'core/button',
						...coblocks.reduce(
							( blocks, block ) =>
								block.name.endsWith( 'buttons' ) ? blocks : [ ...blocks, block.name ],
							[]
						),
					],
				},
			},
		} }
	/>
);

export default PostCommentFormTextarea;
