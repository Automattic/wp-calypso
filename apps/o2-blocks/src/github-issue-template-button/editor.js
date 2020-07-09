/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { TextControl, TextareaControl, Button, CustomSelectControl } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { InspectorControls } from '@wordpress/block-editor';
import { Fragment } from '@wordpress/element';

const newGithubIssueUrl = require( 'new-github-issue-url' );

import './editor.scss';

const icon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		aria-label="GitHub"
		role="img"
		viewBox="0 0 512 512"
		width="24"
		height="24"
	>
		<rect width="512" height="512" rx="15%" fill="#1B1817" />
		<path
			fill="#fff"
			d="M335 499c14 0 12 17 12 17H165s-2-17 12-17c13 0 16-6 16-12l-1-50c-71 16-86-28-86-28-12-30-28-37-28-37-24-16 1-16 1-16 26 2 40 26 40 26 22 39 59 28 74 22 2-17 9-28 16-35-57-6-116-28-116-126 0-28 10-51 26-69-3-6-11-32 3-67 0 0 21-7 70 26 42-12 86-12 128 0 49-33 70-26 70-26 14 35 6 61 3 67 16 18 26 41 26 69 0 98-60 120-117 126 10 8 18 24 18 48l-1 70c0 6 3 12 16 12z"
		/>
	</svg>
);

registerBlockType( 'a8c/github-issue-template-button', {
	title: __( 'Github Isssue Template Button', 'a8c' ),
	icon,
	category: 'layout',
	attributes: {
		userOrOrg: {
			type: 'string',
			default: 'automattic',
		},
		repo: {
			type: 'string',
		},
		title: {
			type: 'string',
		},
		body: {
			type: 'string',
		},
		buttonLabel: {
			type: 'string',
			default: 'Create Issue',
		},
		alignment: {
			type: 'string',
		},
	},
	edit: ( props ) => {
		const {
			attributes: { userOrOrg, repo, title, body, buttonLabel, alignment },
		} = props;

		const alignmentOptions = [
			{ key: 'flex-start', name: 'Left' },
			{ key: 'center', name: 'Center' },
			{ key: 'flex-end', name: 'End' },
		];

		const onChangeUserOrOrg = ( newUserOrOrg ) => {
			props.setAttributes( { userOrOrg: newUserOrOrg } );
		};

		const onChangeRepoName = ( newRepo ) => {
			props.setAttributes( { repo: newRepo } );
		};

		const onChangeTitle = ( newTitle ) => {
			props.setAttributes( { title: newTitle } );
		};

		const onChangeBody = ( newBody ) => {
			props.setAttributes( { body: newBody } );
		};

		const onChangeButtonLabel = ( newButtonLabel ) => {
			props.setAttributes( { buttonLabel: newButtonLabel } );
		};

		const onChangeAlignment = ( control ) => {
			props.setAttributes( { alignment: control.selectedItem.key } );
		};

		return (
			<Fragment>
				<div className={ `wp-block-github-issue-template-button ${ alignment }` }>
					<Button isPrimary>
						<Icon icon={ icon } />
						&nbsp;{ buttonLabel }
					</Button>
				</div>
				<InspectorControls>
					<TextControl
						label={ __( 'User or Organization' ) }
						onChange={ onChangeUserOrOrg }
						value={ userOrOrg }
					/>
					<TextControl
						label={ __( 'Repository Name' ) }
						onChange={ onChangeRepoName }
						value={ repo }
					/>
					<TextControl label={ __( 'Issue Title' ) } onChange={ onChangeTitle } value={ title } />
					<TextareaControl label={ __( 'Issue body' ) } onChange={ onChangeBody } value={ body } />
					<TextControl
						label={ __( 'Button Label' ) }
						onChange={ onChangeButtonLabel }
						value={ buttonLabel }
					/>
					<CustomSelectControl
						label={ __( 'Alignment' ) }
						options={ alignmentOptions }
						value={
							alignmentOptions.find( ( option ) => option.key === alignment ) ||
							alignmentOptions[ 0 ]
						}
						onChange={ onChangeAlignment }
					/>
				</InspectorControls>
			</Fragment>
		);
	},
	save: ( props ) => {
		let url;

		const {
			attributes: { userOrOrg, repo, title, body, buttonLabel, alignment },
		} = props;

		if ( repo ) {
			url = newGithubIssueUrl( {
				title,
				repo,
				user: userOrOrg,
				body,
			} );
		}

		return (
			<div className="block" style={ `display: flex; justify-content: ${ alignment }` }>
				<Icon icon={ icon } />
				&nbsp;
				<Button isPrimary href={ url || '' }>
					{ buttonLabel }
				</Button>
			</div>
		);
	},
} );
