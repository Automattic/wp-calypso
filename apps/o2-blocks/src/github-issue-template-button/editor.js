/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { TextControl, TextareaControl, Button as WordpressButton } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { InspectorControls } from '@wordpress/block-editor';
import * as newGithubIssueUrl from 'new-github-issue-url';

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

const Button = ( props ) => (
	<WordpressButton
		isPrimary
		style={ { display: 'flex', justifyContent: 'center', alignItems: 'center' } }
		href={ props.url }
	>
		{ props.children }
		{ props.label }
	</WordpressButton>
);

const GithubButton = ( props ) => (
	<Button { ...props }>
		<Icon icon={ icon } style={ { marginRight: '5px' } } />
	</Button>
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
		align: {
			type: 'string',
			default: 'left',
		},
	},
	supports: {
		align: [ 'left', 'center', 'right' ],
	},
	edit: ( props ) => {
		const {
			attributes: { userOrOrg, repo, title, body, buttonLabel, align },
		} = props;

		const requiredFieldsFilled = userOrOrg && repo;

		const UnconfiguredButton = () => <Button label="⚙ Configure me first" />;

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

		return (
			<>
				{ requiredFieldsFilled ? <GithubButton label={ buttonLabel } /> : <UnconfiguredButton /> }
				<InspectorControls>
					<TextControl
						label={ __( 'User or Organization*' ) }
						help="*This field is required"
						onChange={ onChangeUserOrOrg }
						value={ userOrOrg }
					/>
					<TextControl
						label={ __( 'Repository Name*' ) }
						help="*This field is required"
						onChange={ onChangeRepoName }
						value={ repo }
					/>
					<TextControl label={ __( 'Issue Title' ) } onChange={ onChangeTitle } value={ title } />
					<TextareaControl label={ __( 'Issue Body' ) } onChange={ onChangeBody } value={ body } />
					<TextControl
						label={ __( 'Button Label' ) }
						onChange={ onChangeButtonLabel }
						value={ buttonLabel }
					/>
				</InspectorControls>
			</>
		);
	},
	save: ( props ) => {
		const {
			attributes: { userOrOrg, repo, title, body, buttonLabel, align },
		} = props;

		const requiredFieldsFilled = userOrOrg && repo;
		if ( requiredFieldsFilled ) {
			const url = newGithubIssueUrl( {
				title,
				repo,
				user: userOrOrg,
				body,
			} );

			return (
				<div className={ `align${ align }` }>
					<GithubButton label={ buttonLabel } url={ url } />
				</div>
			);
		}
	},
} );
