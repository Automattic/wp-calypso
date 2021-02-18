/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { TextControl, TextareaControl } from '@wordpress/components';
import * as createIssueUrl from 'new-github-issue-url';
import { SVG, Rect, Path } from '@wordpress/primitives';
import classNames from 'classnames';

import './editor.scss';

const icon = (
	<SVG
		xmlns="http://www.w3.org/2000/svg"
		aria-label="GitHub"
		role="img"
		viewBox="0 0 512 512"
		width="24"
		height="24"
	>
		<Rect width="512" height="512" rx="15%" fill="#1B1817" />
		<Path
			fill="#fff"
			d="M335 499c14 0 12 17 12 17H165s-2-17 12-17c13 0 16-6 16-12l-1-50c-71 16-86-28-86-28-12-30-28-37-28-37-24-16 1-16 1-16 26 2 40 26 40 26 22 39 59 28 74 22 2-17 9-28 16-35-57-6-116-28-116-126 0-28 10-51 26-69-3-6-11-32 3-67 0 0 21-7 70 26 42-12 86-12 128 0 49-33 70-26 70-26 14 35 6 61 3 67 16 18 26 41 26 69 0 98-60 120-117 126 10 8 18 24 18 48l-1 70c0 6 3 12 16 12z"
		/>
	</SVG>
);

const Shell = ( { as: El = 'div', className, title, subtitle, body, ...elementProps } ) => {
	return (
		<El { ...elementProps } className={ classNames( 'wp-block-a8c-github-template', className ) }>
			<div className="wp-block-a8c-github-template__icon" />
			<div className="wp-block-a8c-github-template__title">{ title }</div>
			<div className="wp-block-a8c-github-template__sub-title">{ subtitle }</div>
			{ body && <div className="wp-block-a8c-github-template__body">{ body }</div> }
		</El>
	);
};

const Edit = ( {
	onChangeTitle,
	onChangeUserOrOrg,
	onChangeRepoName,
	onChangeBody,
	title,
	userOrOrg,
	repo,
	body,
} ) => (
	<Shell
		className="is-edit"
		title={ <TextControl placeholder="Issue Title" onChange={ onChangeTitle } value={ title } /> }
		subtitle={
			<>
				<TextControl
					placeholder="User or Organization"
					onChange={ onChangeUserOrOrg }
					value={ userOrOrg }
				/>
				&nbsp;/&nbsp;
				<TextControl placeholder="Repository" onChange={ onChangeRepoName } value={ repo } />
			</>
		}
		body={ <TextareaControl placeholder="Issue Body" onChange={ onChangeBody } value={ body } /> }
	/>
);

const View = ( { title, userOrOrg, repo, ...rest } ) => (
	<Shell
		title={ __( 'Create Issue' ) + ( title ? ` "${ title }"` : '' ) }
		subtitle={ `${ userOrOrg }/${ repo }` }
		{ ...rest }
	/>
);

const Invalid = () => (
	<Shell
		className="is-warning"
		title={ __( 'Please fill in the required fields' ) }
		subtitle={ __(
			'Org and Repository are required. Select this block to open the form and fill them.'
		) }
	/>
);

registerBlockType( 'a8c/github-issue-template', {
	title: __( 'Github Issue Template', 'a8c' ),
	icon,
	category: 'layout',
	attributes: {
		userOrOrg: {
			type: 'string',
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
	},
	edit: ( { setAttributes, attributes, attributes: { userOrOrg, repo }, isSelected } ) => {
		const handlers = {
			onChangeUserOrOrg( newUserOrOrg ) {
				setAttributes( { userOrOrg: newUserOrOrg } );
			},

			onChangeRepoName( newRepo ) {
				setAttributes( { repo: newRepo } );
			},

			onChangeTitle( newTitle ) {
				setAttributes( { title: newTitle } );
			},

			onChangeBody( newBody ) {
				setAttributes( { body: newBody } );
			},
		};

		const isValid = Boolean( userOrOrg && repo );
		const { body, ...viewAttributes } = attributes;

		if ( isSelected ) {
			return <Edit { ...handlers } { ...attributes } />;
		}

		return isValid ? <View { ...viewAttributes } /> : <Invalid />;
	},
	save: ( { attributes: { userOrOrg, repo, title, body } } ) => {
		const isValid = Boolean( userOrOrg && repo );
		if ( isValid ) {
			const url = createIssueUrl( {
				title,
				repo,
				user: userOrOrg,
				body,
			} );

			const viewAttributes = { title, userOrOrg, repo };

			return <View as="a" href={ url } { ...viewAttributes } />;
		}
	},
} );
