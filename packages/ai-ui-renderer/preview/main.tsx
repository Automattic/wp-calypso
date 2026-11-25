import './style.scss';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
	InteractiveUiSurface,
	createInteractiveUiCatalog,
	createInteractiveUiRuntime,
	LAYOUT_CATALOG,
} from '../src';
import { BASIC_CATALOG_ID, LAYOUT_CATALOG_ID } from '../src/capabilities';
function previewImage( n: number ) {
	const colors = [
		[ '#f0e8dc', '#ad6646' ],
		[ '#e5eadb', '#526343' ],
		[ '#dae8ed', '#417489' ],
	][ n - 1 ];
	return (
		'data:image/svg+xml,' +
		encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" width="660" height="300"><rect width="660" height="300" fill="${ colors[ 0 ] }"/><path d="M0 250 Q160 60 330 210 T660 190V300H0" fill="${ colors[ 1 ] }"/><text x="30" y="100" fill="#262626" font-size="35" font-family="Georgia">Ideas worth sharing.</text></svg>`
		)
	);
}
function App() {
	const pending = useRef< { finish: () => void; fail: () => void } | null >( null );
	const [ theme, setTheme ] = useState(
		new URLSearchParams( location.search ).get( 'theme' ) ?? 'chatgpt'
	);
	const [ dark, setDark ] = useState( true );
	const [ narrow, setNarrow ] = useState( false );
	const [ busy, setBusy ] = useState( false );
	const [ error, setError ] = useState( '' );
	const [ runtime ] = useState( () =>
		createInteractiveUiRuntime( {
			catalogs: [ createInteractiveUiCatalog(), createInteractiveUiCatalog( LAYOUT_CATALOG ) ],
			actionMode: 'tool-call',
			onError: ( e ) => setError( e.message ),
			onAction: ( action ) => {
				if ( action.name === 'toggle_theme' ) {
					setDark( ( d ) => ! d );
					setTheme( ( t ) => ( t === 'chatgpt' ? 'another-client' : 'chatgpt' ) );
					return Promise.resolve();
				}
				setBusy( true );
				setError( '' );
				return new Promise< void >( ( resolve, reject ) => {
					pending.current = {
						finish: () => {
							setBusy( false );
							resolve();
						},
						fail: () => {
							setBusy( false );
							reject( new Error( 'The preview request failed. Try again.' ) );
						},
					};
				} );
			},
		} )
	);
	useEffect(
		() => () => {
			pending.current?.finish();
			runtime.dispose();
		},
		[ runtime ]
	);
	if ( ! runtime.getSurface( 'preview' ) ) {
		const components: Record< string, unknown >[] = [
			{
				id: 'root',
				component: 'Stack',
				catalogId: LAYOUT_CATALOG_ID,
				gap: 'xl',
				children: [ 'heading', 'search_row', 'grid', 'split_heading', 'split', 'start', 'modal' ],
			},
			{
				id: 'start',
				component: 'Stack',
				catalogId: LAYOUT_CATALOG_ID,
				gap: 'md',
				children: [ 'start_heading', 'brief', 'site_type', 'features' ],
			},
			{ id: 'start_heading', component: 'Text', text: '### Start a site' },
			{
				id: 'brief',
				component: 'TextField',
				label: 'What’s your site for?',
				placeholder: 'For example, a bakery in Leeds with online pre-orders',
				value: { '@path': '/brief' },
			},
			{
				id: 'site_type',
				component: 'ChoicePicker',
				label: 'Type of site',
				displayStyle: 'chips',
				options: [ 'Business', 'Portfolio', 'Blog', 'Online store', 'Restaurant', 'Personal' ].map(
					( label ) => ( { label, value: label.toLowerCase().replace( ' ', '_' ) } )
				),
				value: { '@path': '/site_type' },
			},
			{
				id: 'features',
				component: 'ChoicePicker',
				label: 'Features',
				variant: 'multipleSelection',
				displayStyle: 'chips',
				options: [ 'Newsletter', 'Contact form', 'Bookings', 'Gallery' ].map( ( label ) => ( {
					label,
					value: label.toLowerCase().replace( ' ', '_' ),
				} ) ),
				value: { '@path': '/features' },
				checks: [
					{
						condition: { '@call': 'required', args: { value: { '@path': '/features' } } },
						message: 'Pick at least one feature.',
					},
				],
			},
			{ id: 'split_heading', component: 'Text', text: '### Responsive detail layout' },
			{
				id: 'split',
				component: 'Grid',
				catalogId: LAYOUT_CATALOG_ID,
				balance: 'wideStart',
				gap: 'lg',
				children: [ 'detail_preview', 'detail_info' ],
			},
			{ id: 'detail_preview', component: 'Card', child: 'detail_image' },
			{
				id: 'detail_image',
				component: 'Image',
				url: previewImage( 1 ),
				description: 'Site preview',
				variant: 'header',
				fit: 'cover',
			},
			{ id: 'detail_info', component: 'Card', child: 'detail_text' },
			{
				id: 'detail_text',
				component: 'Text',
				text: '### Aster Journal\n\nA responsive 3:2 layout. Narrow containers stack these panels in reading order.',
			},
			{ id: 'heading', component: 'Text', text: '## Your sites' },
			{ id: 'search_row', component: 'Row', align: 'end', children: [ 'search', 'search_button' ] },
			{
				id: 'search',
				component: 'TextField',
				label: 'Search sites',
				value: { '@path': '/search' },
			},
			{
				id: 'search_button',
				component: 'Button',
				child: 'search_label',
				action: { event: { name: 'search' } },
			},
			{ id: 'search_label', component: 'Text', text: 'Search' },
			{
				id: 'grid',
				component: 'Grid',
				catalogId: LAYOUT_CATALOG_ID,
				minColumnWidth: 248,
				columns: 3,
				gap: 'lg',
				children: [ 'card_1', 'card_2', 'card_3' ],
			},
			{
				id: 'modal',
				component: 'Modal',
				trigger: 'modal_trigger',
				content: 'modal_content',
				accessibility: { label: 'Site details' },
			},
			{
				id: 'modal_trigger',
				component: 'Button',
				variant: 'borderless',
				child: 'modal_label',
				action: { event: { name: 'details' } },
			},
			{ id: 'modal_label', component: 'Text', text: 'View details' },
			{
				id: 'modal_content',
				component: 'Column',
				children: [ 'modal_text', 'modal_button', 'modal_theme' ],
			},
			{
				id: 'modal_text',
				component: 'Text',
				text: '### Aster Journal\n\nManage your site from this conversation.',
			},
			{
				id: 'modal_button',
				component: 'Button',
				variant: 'primary',
				child: 'modal_action_label',
				action: { event: { name: 'write' } },
			},
			{ id: 'modal_action_label', component: 'Text', text: 'Write a post' },
			{
				id: 'modal_theme',
				component: 'Button',
				variant: 'borderless',
				child: 'modal_theme_label',
				action: { event: { name: 'toggle_theme' } },
			},
			{ id: 'modal_theme_label', component: 'Text', text: 'Switch theme' },
		];
		[ 'Aster Journal', 'Maple Studio', 'Coastal Notes' ].forEach( ( title, i ) => {
			const n = i + 1;
			components.push(
				{ id: `card_${ n }`, component: 'Card', child: `body_${ n }` },
				{
					id: `body_${ n }`,
					component: 'Stack',
					catalogId: LAYOUT_CATALOG_ID,
					gap: 'md',
					children: [
						`preview_${ n }`,
						`title_${ n }`,
						`domain_${ n }`,
						`status_${ n }`,
						`button_${ n }`,
					],
				},
				{
					id: `preview_${ n }`,
					component: 'Image',
					url: previewImage( n ),
					description: `${ title } preview`,
					variant: 'header',
					fit: 'cover',
				},
				{ id: `title_${ n }`, component: 'Text', text: `### ${ title }` },
				{
					id: `domain_${ n }`,
					component: 'Text',
					text: `${ [ 'asterjournal', 'maplestudio', 'coastalnotes' ][ i ] }.example`,
				},
				{ id: `status_${ n }`, component: 'Text', text: i === 2 ? 'Coming soon' : 'Public' },
				{
					id: `button_${ n }`,
					component: 'Button',
					variant: i === 0 ? 'primary' : 'default',
					child: `button_label_${ n }`,
					action: { event: { name: 'open', context: { siteId: n } } },
				},
				{ id: `button_label_${ n }`, component: 'Text', text: 'Open site' }
			);
		} );
		runtime.processMessages(
			[
				{ version: 'v1.0', createSurface: { surfaceId: 'preview', catalogId: BASIC_CATALOG_ID } },
				{ version: 'v1.0', updateComponents: { surfaceId: 'preview', components } },
			],
			'preview'
		);
	}
	return (
		<>
			<nav>
				<strong>AI UI component preview</strong>
				<label>
					Theme{ ' ' }
					<select value={ theme } onChange={ ( e ) => setTheme( e.target.value ) }>
						<option value="">WordPress default</option>
						<option value="chatgpt">ChatGPT</option>
						<option value="another-client">Another client</option>
					</select>
				</label>
				<button onClick={ () => setDark( ! dark ) }>Toggle light/dark</button>
				<button onClick={ () => setNarrow( ! narrow ) }>Toggle phone width</button>
				<button onClick={ () => pending.current?.finish() }>Finish request</button>
				<button onClick={ () => pending.current?.fail() }>Fail request</button>
			</nav>
			<main
				className={ dark ? 'a2ui-dark' : 'a2ui-light' }
				style={ {
					width: narrow ? 358 : 'auto',
					background: dark ? '#212121' : 'white',
					color: dark ? 'white' : '#171717',
				} }
			>
				<div className="outside-control">Host content outside the themed surface</div>
				<InteractiveUiSurface
					surface={ runtime.getSurface( 'preview' )! }
					theme={ theme || undefined }
					disabled={ busy }
					fallback={ <p>Preview failed</p> }
				/>
				{ error && <p role="alert">{ error }</p> }
			</main>
		</>
	);
}
createRoot( document.getElementById( 'app' )! ).render( <App /> );
