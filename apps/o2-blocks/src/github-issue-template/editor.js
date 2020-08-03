/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockType } from '@wordpress/blocks';
import { TextControl, TextareaControl } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import * as createIssueUrl from 'new-github-issue-url';
import { SVG } from '@wordpress/primitives';
import classNames from 'classnames';

import './editor.scss';

const githubIcon = (
	<SVG
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
	</SVG>
);

const Shell = ( props ) => {
	const El = props.as || 'div';
	const { className, title, subTitle, icon, body } = props;
	return (
		<El { ...props.attrs } className={ classNames( 'wp-block-a8c-github-template', className ) }>
			{ typeof icon === 'string' ? (
				<div className="github-template__icon">{ icon }</div>
			) : (
				<Icon className="github-template__icon" icon={ icon || githubIcon } />
			) }
			<span className="github-template__title">{ title }</span>
			<div className="github-template__sub-title">{ subTitle }</div>
			{ props.body && <span className="github-template__body">{ body }</span> }
		</El>
	);
};

const Edit = ( props ) => {
	const {
		onChangeTitle,
		onChangeUserOrOrg,
		onChangeRepoName,
		onChangeBody,
		title,
		userOrOrg,
		repo,
		body,
	} = props;
	return (
		<Shell
			className="is-edit"
			title={ <TextControl onChange={ onChangeTitle } value={ title } /> }
			subTitle={
				<>
					<TextControl onChange={ onChangeUserOrOrg } value={ userOrOrg } />
					&nbsp;/&nbsp;
					<TextControl onChange={ onChangeRepoName } value={ repo } />
				</>
			}
			body={ <TextareaControl onChange={ onChangeBody } value={ body } /> }
		/>
	);
};

const View = ( props ) => {
	const { title, userOrOrg, repo, ...rest } = props;
	return (
		<Shell
			title={ `${ __( 'Create Issue:' ) } ${ title }` }
			subTitle={ `${ userOrOrg }/${ repo }` }
			{ ...rest }
		/>
	);
};

const Invalid = () => (
	<Shell
		className="is-warning"
		title="You must provide an org and repo!"
		subTitle="Please click here to re-configure to avoid the block from not rendering in the frontend"
		icon="⚠"
	/>
);

registerBlockType( 'a8c/github-issue-template', {
	title: __( 'Github Issue Template', 'a8c' ),
	icon: githubIcon,
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
	edit: ( props ) => {
		const {
			attributes,
			attributes: { userOrOrg, repo },
			isSelected,
		} = props;

		const handlers = {
			onChangeUserOrOrg( newUserOrOrg ) {
				props.setAttributes( { userOrOrg: newUserOrOrg } );
			},

			onChangeRepoName( newRepo ) {
				props.setAttributes( { repo: newRepo } );
			},

			onChangeTitle( newTitle ) {
				props.setAttributes( { title: newTitle } );
			},

			onChangeBody( newBody ) {
				props.setAttributes( { body: newBody } );
			},
		};

		const isValid = userOrOrg && repo;
		const { body, ...viewAttributes } = attributes;

		if ( isSelected ) {
			return <Edit { ...handlers } { ...attributes } />;
		}

		return isValid ? <View { ...viewAttributes } /> : <Invalid />;
	},
	save: ( props ) => {
		const {
			attributes: { userOrOrg, repo, title, body },
		} = props;

		const isValid = userOrOrg && repo;
		if ( isValid ) {
			const url = createIssueUrl( {
				title,
				repo,
				user: userOrOrg,
				body,
			} );

			const viewAttributes = { title, userOrOrg, repo };

			return <View as="a" attrs={ { href: url } } { ...viewAttributes } />;
		}
	},
} );
