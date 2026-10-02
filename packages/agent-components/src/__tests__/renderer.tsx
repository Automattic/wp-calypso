import { fireEvent, render, screen } from '@testing-library/react';
import { SurfaceRenderer } from '../renderer';
import { useComponentSession } from '../use-component-session';
import { applied, completed, opening } from './fixtures';
import type { Surface } from '../types';

const confirmationActions = {
	allowedActions: new Set( [ 'tool.execute' ] ),
	actionBindings: { 'tool.execute': [] },
};

function formSurface(): Surface {
	return {
		protocol: 'minimal-ai-ui/0.1',
		rootId: 'root',
		components: {
			root: {
				id: 'root',
				type: 'Column',
				children: [ 'row', 'description', 'formats', 'locked', 'preview', 'status', 'submit' ],
			},
			row: { id: 'row', type: 'Row', children: [ 'title', 'topic' ] },
			title: {
				id: 'title',
				type: 'TextField',
				label: 'Title',
				path: '/form/title',
				inputMode: 'shortText',
				required: true,
				validationMessage: 'Choose a title.',
			},
			description: {
				id: 'description',
				type: 'TextField',
				label: 'Description',
				path: '/form/description',
				inputMode: 'longText',
				placeholder: 'Describe the post',
			},
			topic: {
				id: 'topic',
				type: 'ChoicePicker',
				label: 'Topic',
				path: '/form/topic',
				mode: 'single',
				options: [
					{ value: 'news', label: 'News' },
					{ value: 'notes', label: 'Notes' },
				],
			},
			formats: {
				id: 'formats',
				type: 'ChoicePicker',
				label: 'Formats',
				path: '/form/formats',
				mode: 'multiple',
				options: [
					{ value: 'text', label: 'Text' },
					{ value: 'audio', label: 'Audio' },
				],
			},
			locked: {
				id: 'locked',
				type: 'TextField',
				label: 'Locked',
				path: '/form/locked',
				inputMode: 'shortText',
				disabled: true,
			},
			preview: { id: 'preview', type: 'Text', variant: 'body', content: { path: '/form/title' } },
			status: {
				id: 'status',
				type: 'Text',
				variant: 'status',
				tone: 'neutral',
				content: { path: '/status' },
			},
			submit: {
				id: 'submit',
				type: 'Button',
				label: 'Publish',
				action: 'post.publish',
				variant: 'primary',
			},
		},
		data: {
			form: {
				title: 'Draft title',
				description: '',
				topic: 'news',
				formats: [ 'text' ],
				locked: 'Fixed',
			},
			status: false,
		},
	};
}

const formActions = {
	allowedActions: new Set( [ 'post.publish' ] ),
	actionBindings: {
		'post.publish': [ '/form/title', '/form/description', '/form/topic', '/form/formats' ],
	},
};

describe( 'SurfaceRenderer', () => {
	it( 'links HTTP edit URLs while preserving surrounding text and punctuation', () => {
		const result = completed();
		const text =
			'Edit: https://example.com/wp-admin/post.php?post=42&action=edit.\nPreview (http://example.com/?p=42).';
		result.surface.components.proposal = {
			id: 'proposal',
			type: 'Text',
			variant: 'body',
			content: { text },
		};
		const { container } = render(
			<SurfaceRenderer surface={ result.surface } onAction={ jest.fn() } />
		);
		const links = screen.getAllByRole( 'link' );
		expect( links ).toHaveLength( 2 );
		expect( links[ 0 ] ).toHaveAttribute(
			'href',
			'https://example.com/wp-admin/post.php?post=42&action=edit'
		);
		expect( links[ 1 ] ).toHaveAttribute( 'href', 'http://example.com/?p=42' );
		expect( links[ 0 ] ).toHaveAttribute( 'target', '_blank' );
		expect( links[ 0 ] ).toHaveAttribute( 'rel', 'noopener noreferrer' );
		expect( container.querySelector( 'p' )?.textContent ).toBe( text );
	} );

	it( 'renders Markdown images, formatting, and GFM content', () => {
		const result = completed();
		result.surface.components.proposal = {
			id: 'proposal',
			type: 'Text',
			variant: 'body',
			content: {
				text: '**Preview**\n\n![Site preview](https://example.com/preview.png)\n\n[Edit site](https://example.com/edit)\n\n- First\n- ~~Second~~\n\n| Name | Status |\n| --- | --- |\n| Site | Ready |\n\n- [x] Reviewed\n\n```js\nconst ready = true;\n```',
			},
		};
		const { container } = render(
			<SurfaceRenderer surface={ result.surface } onAction={ jest.fn() } />
		);
		expect( screen.getByRole( 'img', { name: 'Site preview' } ) ).toHaveAttribute(
			'src',
			'https://example.com/preview.png'
		);
		expect( screen.getByText( 'Preview' ).tagName ).toBe( 'STRONG' );
		expect( screen.getByRole( 'link', { name: 'Edit site' } ) ).toHaveAttribute(
			'href',
			'https://example.com/edit'
		);
		expect( screen.getByText( 'Second' ).tagName ).toBe( 'DEL' );
		expect( screen.getByRole( 'table' ) ).toBeVisible();
		expect( screen.getByRole( 'checkbox' ) ).toBeChecked();
		expect( screen.getByRole( 'checkbox' ) ).toBeDisabled();
		expect( container.querySelector( 'pre code' ) ).toHaveTextContent( 'const ready = true;' );
		expect( container.querySelector( 'p p, p table, p ul' ) ).toBeNull();
	} );

	it.each( [
		[ 'heading', 'heading' ],
		[ 'body', null ],
		[ 'caption', null ],
		[ 'status', 'status' ],
	] as const )( 'renders bound Markdown content for the %s variant', ( variant, role ) => {
		const surface = completed().surface;
		surface.components.proposal = {
			id: 'proposal',
			type: 'Text',
			content: { path: '/preview' },
			...( variant === 'status' ? { variant, tone: 'success' } : { variant } ),
		};
		surface.data = { preview: '**Preview** ![Screenshot](https://example.com/preview.png)' };
		const { container } = render( <SurfaceRenderer surface={ surface } onAction={ jest.fn() } /> );
		expect( screen.getByRole( 'img', { name: 'Screenshot' } ) ).toBeVisible();
		expect( screen.getByText( 'Preview' ).tagName ).toBe( 'STRONG' );
		const text = container.querySelector( '.agent-components-text' );
		expect( text?.getAttribute( 'role' ) ).toBe( role );
		expect( text?.getAttribute( 'aria-level' ) ).toBe( variant === 'heading' ? '3' : null );
	} );

	it( 'sanitizes unsafe Markdown URLs and escapes raw HTML', () => {
		const result = completed();
		const text =
			'[Unsafe](javascript:alert%281%29)\n\n![Unsafe image](data:image/svg+xml,example)\n\n<img src="x" onerror="alert(1)">';
		result.surface.components.proposal = {
			id: 'proposal',
			type: 'Text',
			variant: 'body',
			content: { text },
		};
		const { container } = render(
			<SurfaceRenderer surface={ result.surface } onAction={ jest.fn() } />
		);
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.getByAltText( 'Unsafe image' ) ).not.toHaveAttribute( 'src' );
		expect( container.querySelector( '[onerror]' ) ).toBeNull();
		expect( screen.getByText( '<img src="x" onerror="alert(1)">' ) ).toBeVisible();
	} );

	it( 'renders proposal as plain text and emits only the named action', () => {
		const result = opening();
		result.surface.components.proposal = {
			id: 'proposal',
			type: 'Text',
			variant: 'body',
			content: { text: '<script>alert(1)</script>' },
		};
		const onAction = jest.fn();
		const { container, rerender } = render(
			<SurfaceRenderer
				surface={ result.surface }
				onAction={ onAction }
				{ ...confirmationActions }
			/>
		);
		expect( screen.getByText( '<script>alert(1)</script>' ) ).toBeVisible();
		expect( container.querySelector( 'script' ) ).toBeNull();
		fireEvent.click( screen.getByRole( 'button', { name: 'Activate Example Plugin' } ) );
		expect( onAction ).toHaveBeenCalledWith( { name: 'tool.execute', values: {} } );
		rerender(
			<SurfaceRenderer
				surface={ result.surface }
				disabled
				onAction={ onAction }
				{ ...confirmationActions }
			/>
		);
		fireEvent.click( screen.getByRole( 'button' ) );
		expect( onAction ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'uses the same session across rerenders and removes the completed button', async () => {
		const transport = jest.fn().mockResolvedValue( applied() );
		const onContinue = jest.fn().mockResolvedValue( undefined );
		function Confirmation() {
			const session = useComponentSession( {
				result: opening(),
				transport,
				onContinue,
				createRequestId: () => 'request-123',
			} );
			if ( ! session.result ) {
				return <p>Loading…</p>;
			}
			return (
				<SurfaceRenderer
					surface={ session.result.surface }
					disabled={ session.phase !== 'ready' }
					onAction={ session.submit }
					{ ...confirmationActions }
				/>
			);
		}
		const { rerender } = render( <Confirmation /> );
		fireEvent.click( screen.getByRole( 'button' ) );
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
		expect( await screen.findByText( completed().summary ) ).toBeVisible();
		rerender( <Confirmation /> );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		expect( transport ).toHaveBeenCalledTimes( 1 );
		expect( onContinue ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'labels editors and projects only declared enabled values from the shared draft', () => {
		const onAction = jest.fn();
		const { container } = render(
			<SurfaceRenderer surface={ formSurface() } onAction={ onAction } { ...formActions } />
		);
		const title = screen.getByRole( 'textbox', { name: 'Title' } );
		expect( title ).toBeRequired();
		expect( title ).toHaveAttribute( 'aria-invalid', 'true' );
		expect( title ).toHaveAccessibleDescription( 'Choose a title.' );
		expect( screen.getByRole( 'textbox', { name: 'Description' } ).tagName ).toBe( 'TEXTAREA' );
		expect( screen.getByRole( 'textbox', { name: 'Locked' } ) ).toBeDisabled();
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'false' );
		expect( container.querySelector( '.agent-components-row' ) ).toBeInTheDocument();
		fireEvent.change( title, { target: { value: '<b>Edited title</b>' } } );
		fireEvent.change( screen.getByRole( 'textbox', { name: 'Description' } ), {
			target: { value: 'Details' },
		} );
		fireEvent.change( screen.getByRole( 'combobox', { name: 'Topic' } ), {
			target: { value: 'notes' },
		} );
		expect( screen.getByRole( 'group', { name: 'Formats' } ) ).toBeVisible();
		expect( screen.getByRole( 'checkbox', { name: 'Text' } ) ).toBeChecked();
		fireEvent.click( screen.getByRole( 'checkbox', { name: 'Audio' } ) );
		expect( screen.getByText( '<b>Edited title</b>' ) ).toBeVisible();
		expect( container.querySelector( 'b' ) ).toBeNull();
		fireEvent.click( screen.getByRole( 'button', { name: 'Publish' } ) );
		expect( onAction ).toHaveBeenCalledWith( {
			name: 'post.publish',
			values: {
				'/form/title': '<b>Edited title</b>',
				'/form/description': 'Details',
				'/form/topic': 'notes',
				'/form/formats': [ 'text', 'audio' ],
			},
		} );
		fireEvent.click( screen.getByRole( 'checkbox', { name: 'Text' } ) );
		fireEvent.click( screen.getByRole( 'button', { name: 'Publish' } ) );
		expect( onAction ).toHaveBeenLastCalledWith( {
			name: 'post.publish',
			values: expect.objectContaining( { '/form/formats': [ 'audio' ] } ),
		} );
	} );

	it( 'requires host eligibility and blocks disabled, loading and pending controls', () => {
		const surface = formSurface();
		const onAction = jest.fn();
		const { rerender } = render( <SurfaceRenderer surface={ surface } onAction={ onAction } /> );
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
		rerender(
			<SurfaceRenderer
				surface={ surface }
				onAction={ onAction }
				allowedActions={ formActions.allowedActions }
			/>
		);
		expect( screen.getByRole( 'button' ) ).toBeDisabled();
		const button = surface.components.submit;
		for ( const property of [ 'disabled', 'loading' ] ) {
			surface.components.submit = {
				...button,
				[ property ]: true,
			} as Surface[ 'components' ][ string ];
			rerender( <SurfaceRenderer surface={ surface } onAction={ onAction } { ...formActions } /> );
			fireEvent.click( screen.getByRole( 'button' ) );
			expect( screen.getByRole( 'button' ) ).toBeDisabled();
		}
		for ( const path of [ '/form/locked', '/status' ] ) {
			rerender(
				<SurfaceRenderer
					surface={ formSurface() }
					onAction={ onAction }
					allowedActions={ formActions.allowedActions }
					actionBindings={ { 'post.publish': [ path ] } }
				/>
			);
			expect( screen.getByRole( 'button' ) ).toBeDisabled();
		}
		rerender(
			<SurfaceRenderer
				surface={ formSurface() }
				onAction={ onAction }
				pending
				messages={ { pending: 'Envoi…' } }
				locale="fr"
				{ ...formActions }
			/>
		);
		expect( screen.getByRole( 'textbox', { name: 'Title' } ) ).toBeDisabled();
		expect( screen.getByRole( 'checkbox', { name: 'Audio' } ) ).toBeDisabled();
		expect( screen.getByRole( 'button' ) ).toHaveAttribute( 'aria-busy', 'true' );
		expect( screen.getByText( 'Envoi…' ) ).toHaveAttribute( 'role', 'status' );
		expect( onAction ).not.toHaveBeenCalled();
	} );

	it( 'updates saved fields in place while preserving drafts outside the submitted action', () => {
		const surface = formSurface();
		const actions = { ...formActions, actionBindings: { 'post.publish': [ '/form/title' ] } };
		const onAction = jest.fn();
		const { rerender } = render(
			<SurfaceRenderer
				surface={ surface }
				identity="post-form"
				onAction={ onAction }
				{ ...actions }
			/>
		);
		const title = screen.getByRole( 'textbox', { name: 'Title' } );
		const description = screen.getByRole( 'textbox', { name: 'Description' } );
		fireEvent.change( title, { target: { value: 'Submitted title' } } );
		fireEvent.change( description, { target: { value: 'Unsaved description' } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Publish' } ) );
		expect( onAction ).toHaveBeenCalledWith( {
			name: 'post.publish',
			values: { '/form/title': 'Submitted title' },
		} );
		const updated = formSurface();
		updated.data.form = {
			title: 'Saved title',
			description: '',
			topic: 'news',
			formats: [ 'text' ],
			locked: 'Fixed',
		};
		rerender(
			<SurfaceRenderer
				surface={ updated }
				identity="post-form"
				onAction={ onAction }
				{ ...actions }
			/>
		);
		expect( screen.getByRole( 'textbox', { name: 'Title' } ) ).toBe( title );
		expect( title ).toHaveValue( 'Saved title' );
		expect( description ).toHaveValue( 'Unsaved description' );
	} );

	it( 'preserves locale projections and resets draft on a business replacement', () => {
		const surface = formSurface();
		const onAction = jest.fn();
		const { rerender } = render(
			<SurfaceRenderer
				surface={ surface }
				identity="instance:1"
				onAction={ onAction }
				{ ...formActions }
			/>
		);
		const title = screen.getByRole( 'textbox', { name: 'Title' } );
		title.focus();
		fireEvent.change( title, { target: { value: 'User draft' } } );
		const translated = formSurface();
		translated.components.title = {
			...translated.components.title,
			label: 'Titre',
		} as Surface[ 'components' ][ string ];
		rerender(
			<SurfaceRenderer
				surface={ translated }
				identity="instance:1"
				locale="fr"
				onAction={ onAction }
				{ ...formActions }
			/>
		);
		expect( screen.getByRole( 'textbox', { name: 'Titre' } ) ).toHaveValue( 'User draft' );
		expect( screen.getByRole( 'textbox', { name: 'Titre' } ) ).toHaveFocus();
		rerender(
			<SurfaceRenderer
				surface={ translated }
				identity="instance:2"
				onAction={ onAction }
				{ ...formActions }
			/>
		);
		expect( screen.getByRole( 'textbox', { name: 'Titre' } ) ).toHaveValue( 'Draft title' );
	} );
} );
