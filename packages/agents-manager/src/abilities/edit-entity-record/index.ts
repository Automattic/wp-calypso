import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { editEntityRecordCallback } from './callback';
import type { Ability } from '../types';

const entityRecordSchema = {
	type: 'object',
	properties: {
		title: { type: [ 'string', 'null' ] },
		excerpt: { type: [ 'string', 'null' ] },
		content: { type: [ 'string', 'null' ] },
		status: { type: [ 'string', 'null' ] },
	},
	additionalProperties: false,
};

const navigationItemSchema = {
	type: 'object',
	properties: {
		clientId: { type: 'string' },
		label: { type: 'string' },
		url: { type: 'string' },
		id: { type: [ 'number', 'string' ] },
		kind: { type: 'string' },
		type: { type: 'string' },
		opensInNewTab: { type: 'boolean' },
		items: { type: 'array', items: { type: 'object' } },
	},
	additionalProperties: false,
};

/**
 * The `edit-entity-record` ability definition.
 *
 * The `big-sky/` name and category are the keys the backend route allowlists
 * match on — renaming either drops the ability from every surface.
 */
export const editEntityRecordAbility: Ability = {
	name: 'big-sky/edit-entity-record',
	label: __( 'Manage Entity Records', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description: __(
		'Create, edit, or delete WordPress data entity records using the data layer',
		__i18n_text_domain__
	),
	meta: {
		instructions: `
			This tool edits global state of the site, affecting both content visible on the site and not.
			<big_sky_site_metadata>
				To change Big Sky site metadata, call 'edit_entity_record' tool with edits entityType:root, entityName: site, recordId: big_sky_site_metadata. Pass in one or more of the following fields to edit:
				<personality>
					Change the personality of the site by setting 'personality' on the site metadata.
					Available personalities are: [[product.wpcom.big_sky.available_personalities|]]
					**Explicit personality requests:**
					- "Can you make the site feel more elegant?"
					- "Make it look serious and trustworthy"
					- "I want a more professional appearance"
					- "Make it more sophisticated"
					- "Can you make it bolder?"
					**Implicit personality requests:**
					- "It's too boring" (suggests need for bold or playful)
					- "Make the copy sound more high-end and premium" (suggests sophisticated)
					- "Can you make the writing more casual and fun?" (suggests playful)
					- "I need a design that's more intense" (suggests bold or dark)
					- "This looks too childish" (suggests professional or sophisticated)
					- "Make it more corporate" (suggests professional)
					### How to Respond to Personality Requests
					When you detect a personality change request:
					Provide a brief, friendly confirmation message like:
					- "Got it, I'll try to make the site feel more [personality trait] going forward when making design choices."
					- "Ok, I've updated the site personality to be more [personality trait]. This will influence future design choices for colors, fonts, and overall styling."
					- "Understood, the site will look more [personality trait] going forward."
					Provide an extremely brief confirmation message - this is a destructive action.
					### Important Guidelines for Personality
					- Only change personality when explicitly or implicitly requested by the user
					- Choose the most appropriate personality based on the user's description
					- Don't explain all available personalities
					- Keep responses brief and confirmatory
					- The personality change will influence future color, font, and design choices
				</personality>
				<siteLocation>
					Example:{"name":"Normalized address","coordinates":[lat, lng]}
				</siteLocation>
			</big_sky_site_metadata>
			<page>
				You can add a page using entityType: postType, entityName: page, record: { status: publish, title: "title" }
				- Add pages with publish status.
				You can edit and delete pages using the entityType: postType, entityName: page, recordId: page_id.
				- Rename pages setting new title field.
				- You can also delete pages, but it is very important to pass the 'confirmationMessage' to the tool call since this is a destructive action. Once the user confirms the deletion, do not pass a 'confirmationMessage'.
			</page>
			<site_title>
				Change the site title by calling 'edit_entity_record' with: entityType: root, entityName: site, record: { title: "<new title>" }, recordId: site_title.
				Note: This updates all 'core/site-title' blocks automatically.
			</site_title>
			<navigation>
				To reorder, add, remove, or relabel navigation menu items, edit the wp_navigation entity instead of editing the core/navigation block.
				Use entityType: postType, entityName: wp_navigation, recordId: the navigation block's numeric ref attribute — a block's clientId is not a ref.
				Preferred format: pass record.navigationItems as the desired final list of menu items. The client will rebuild record.blocks and serialized record.content from the live navigation menu.
				Identify each existing item by its clientId from the page structure, its label, its url, or its page id. Omitting an existing item removes it. Reordering the array reorders the menu. Nest items under a parent with 'items' to build a submenu. Omitting 'items' on a parent leaves its existing children in place; pass an empty items array to empty a submenu.
				Example: { entityType: 'postType', entityName: 'wp_navigation', recordId: 19311, record: { navigationItems: [ { label: 'Home' }, { label: 'About', items: [ { label: 'Services' } ] }, { label: 'Contact', url: '/contact/' } ] } }
			</navigation>
			`,
	},
	input_schema: {
		type: 'object',
		properties: {
			addEntities: {
				type: 'array',
				description:
					'Entities to create. Each item should include entityType, entityName, record, and optional options.',
				items: {
					type: 'object',
					properties: {
						entityType: { type: 'string', enum: [ 'postType' ] },
						entityName: { type: 'string', enum: [ 'post', 'page' ] },
						record: entityRecordSchema,
						options: { type: 'object' },
					},
					required: [ 'entityType', 'entityName', 'record' ],
					additionalProperties: false,
				},
			},
			editEntities: {
				type: 'array',
				description:
					'Entities to edit. Each item should include entityType, entityName, recordId, record, and optional options.',
				items: {
					type: 'object',
					properties: {
						entityType: { type: 'string', enum: [ 'postType', 'root' ] },
						entityName: {
							type: 'string',
							enum: [ 'post', 'page', 'site', 'product', 'wp_navigation' ],
						},
						recordId: { type: [ 'number', 'string' ] },
						record: {
							type: 'object',
							properties: {
								...entityRecordSchema.properties,
								siteLocation: {
									type: [ 'object', 'null' ],
									description: 'The location of the site, only for recordId: big_sky_site_metadata',
									properties: {
										name: { type: [ 'string' ] },
										coordinates: {
											description:
												'The coordinates of the business. First one is the latitude, second one is the longitude.',
											type: [ 'array' ],
											items: { type: [ 'number', 'string' ] },
										},
									},
								},
								personality: {
									type: [ 'string', 'null' ],
									description:
										'The personality of the site, only for recordId: big_sky_site_metadata',
								},
								navigationItems: {
									type: 'array',
									description:
										'Desired final navigation menu items, only for entityName: wp_navigation. Identify existing items by clientId, label, url, or page id. Reorder the array to reorder the menu; omit an item to remove it; nest with items to build a submenu; include label/url to relabel or add items.',
									items: navigationItemSchema,
								},
							},
							additionalProperties: true,
						},
						options: { type: 'object' },
					},
					required: [ 'entityType', 'entityName', 'recordId', 'record' ],
					additionalProperties: false,
				},
			},
			deleteEntities: {
				type: 'array',
				description:
					'Entities to delete. Each item should include entityType, entityName, recordId, and optional options.',
				items: {
					type: 'object',
					properties: {
						entityType: { type: 'string', enum: [ 'postType' ] },
						entityName: { type: 'string', enum: [ 'post', 'page' ] },
						recordId: { type: [ 'number', 'string' ] },
						options: { type: 'object' },
					},
					required: [ 'entityType', 'entityName', 'recordId' ],
					additionalProperties: false,
				},
			},
			confirmationMessage: {
				type: [ 'string', 'null' ],
				description:
					'Brief message to confirm destructive actions. ALWAYS use for deletions and other destructive actions. DO NOT use it for other actions. Form this as a question.',
			},
			summary: {
				type: 'string',
				description:
					"A short, friendly confirmation in the agent's own voice to show to the user after the entity record changes are applied. Mention what changed briefly.",
			},
			followUpTasks: {
				type: 'boolean',
				description:
					'Deprecated. This tool always returns to the agent with a success or error message.',
			},
		},
		required: [],
		additionalProperties: false,
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: {
						type: 'boolean',
						description: 'Whether the entity record changes were applied successfully.',
					},
					message: {
						type: 'string',
						description: 'Human-readable success or error message.',
					},
					error: { type: 'string', description: 'Error details when success is false.' },
					details: {
						type: 'object',
						description: 'Optional details about the created, updated, or deleted entity records.',
					},
				},
				required: [ 'success', 'message' ],
			},
			returnToAgent: { type: 'boolean' },
		},
		required: [ 'result', 'returnToAgent' ],
	},
	callback: editEntityRecordCallback,
};
