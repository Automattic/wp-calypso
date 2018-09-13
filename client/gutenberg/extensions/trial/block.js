/** @format */
/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { Dropdown } from '@wordpress/components';
import { registerBlockType } from '@wordpress/blocks';
import { RichText } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import './style.scss';
import './editor.scss';

const statuses = [
	{ key: 'new', text: 'New' },
	{ key: 'planned', text: 'Planned' },
	{ key: 'in-progress', text: 'In Progress' },
	{ key: 'needs-completion', text: 'Needs Completion' },
	{ key: 'needs-merging', text: 'Needs Merging' },
	{ key: 'done', text: 'Done :)' },
];

const blockAttributes = {
	title: {
		source: 'children',
		selector: 'header',
	},
	description: {
		source: 'children',
		selector: 'article',
	},
	team: {
		source: 'children',
		selector: 'address',
	},
	links: {
		source: 'children',
		selector: 'aside',
	},
	status: {
		type: 'object',
		default: statuses[ 0 ],
	},
};

class Trial extends Component {
	render() {
		const { className } = this.props;
		return (
			<div className={ className }>
				<header>{ this.richText( 'title' ) }</header>
				<div>
					<article>{ this.richText( 'description' ) }</article>
					<address>{ this.richText( 'team' ) }</address>
					<aside>{ this.richText( 'links' ) }</aside>
				</div>
				<footer>{ this.statusChooser() }</footer>
			</div>
		);
	}

	richText( attribute ) {
		const { attributes, setAttributes, edit } = this.props;
		return edit ? (
			<RichText
				key={ 1 }
				placeholder={ __( `Add ${ attribute }…` ) }
				value={ attributes[ attribute ] }
				onChange={ value => setAttributes( { [ attribute ]: value } ) }
			/>
		) : (
			attributes[ attribute ]
		);
	}

	statusChooser() {
		const { attributes, edit, className } = this.props;
		const { status } = attributes;
		return edit ? (
			<Dropdown
				contentClassName={ `${ className }-status-popover` }
				renderToggle={ ( { onToggle } ) => this.statusBadge( status, onToggle ) }
				renderContent={ () => this.allStatusBadges() }
			/>
		) : (
			this.statusBadge( status, () => {} )
		);
	}

	statusBadge( status, onClick ) {
		const { edit } = this.props;
		const clickOnEnter = e => 'Enter' === e.key && onClick();
		const optional = edit ? { tabIndex: '0' } : {};
		return (
			<span
				key={ status.key }
				className={ `status-badge status-${ status.key }` }
				onClick={ onClick }
				onKeyUp={ clickOnEnter }
				role="button"
				tabIndex="0"
				aria-label={ sprintf( 'Status: %s', status.text ) }
				{ ...optional }
			>
				{ status.text.replace( / /g, '\xa0' ) }
			</span>
		);
	}

	allStatusBadges() {
		const { setAttributes } = this.props;
		return (
			<div>
				{ statuses.map( status => this.statusBadge( status, () => setAttributes( { status } ) ) ) }
			</div>
		);
	}
}
registerBlockType( 'a8c/trials-list-item', {
	title: __( 'Trial Project (single item)' ),
	icon: 'universal-access',
	category: 'common',
	keywords: [ __( 'hiring' ), __( 'devex' ), __( 'trial' ) ],
	attributes: blockAttributes,
	parent: [ 'a8c/trials-list' ],

	edit: props => <Trial edit={ true } { ...props } />,
	save: props => <Trial edit={ false } { ...props } />,
} );
