/**
 * External dependencies
 */
import React, { useRef } from 'react';
import { usePromise, useInvokablePromise } from '@jameslnewell/react-promise';

/**
 * Internal dependencies
 */
import { Client } from './Client';

const client = new Client();
const siteId = '160146488';

export default {
	title: 'API/Client',
};

interface MediaItemProps {
	id: string;
	link: string;
	title: string;
}

const MediaItem: React.FC< MediaItemProps > = ( { id, link, title } ) => {
	return (
		<span>
			#{ id } - { title }
			<br />
			<img src={ link } alt="" />
		</span>
	);
};

interface MediaItemListProps {
	items: MediaItemProps[];
}

const MediaItemList: React.FC< MediaItemListProps > = ( { items } ) => {
	return (
		<div>
			{ items.map( item => (
				<MediaItem key={ item.id } { ...item } />
			) ) }
		</div>
	);
};

export const List = () => {
	const [ result ] = usePromise( () => client.list( siteId ), [ client, siteId ] );
	return <div>{ result && result.media && <MediaItemList items={ result.media } /> }</div>;
};

export const CreateFromFile = () => {
	const input = useRef< HTMLInputElement >( null );
	const [ create, result, { isPending, error } ] = useInvokablePromise(
		( file: File ) => client.createFromFile( siteId, file ),
		[ client, siteId ]
	);

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		const file = input?.current?.files?.[ 0 ];
		if ( file ) {
			create( file );
		}
	};

	return (
		<div>
			<form onSubmit={ handleSubmit }>
				<input type="file" ref={ input } />
				<button disabled={ isPending }>Create from File</button>
			</form>
			{ error && <span>{ ( error && error.message ) || error }</span> }
			{ result && result.media && <MediaItemList items={ result.media } /> }
		</div>
	);
};

export const CreateFromURL = () => {
	const input = useRef< HTMLInputElement >( null );
	const [ create, result, { isPending, error } ] = useInvokablePromise(
		( url: string ) => client.createFromURL( siteId, url ),
		[ client, siteId ]
	);

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		const url = input?.current?.value;
		if ( url ) {
			create( url );
		}
	};

	return (
		<div>
			<form onSubmit={ handleSubmit }>
				<input type="text" ref={ input } placeholder="URL" />
				<button disabled={ isPending }>Create from URL</button>
			</form>
			{ error && <span>{ ( error && error.message ) || error }</span> }
			{ result && result.media && <MediaItemList items={ result.media } /> }
		</div>
	);
};

export const Get = () => {
	const input = useRef< HTMLInputElement >( null );
	const [ get, result, { isPending, error } ] = useInvokablePromise(
		( id: string ) => client.get( siteId, id ),
		[ client, siteId ]
	);

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		const id = input?.current?.value;
		if ( id ) {
			get( id );
		}
	};

	return (
		<div>
			<form onSubmit={ handleSubmit }>
				<input type="text" ref={ input } placeholder="ID" />
				<button disabled={ isPending }>Get</button>
			</form>
			{ error && <span>{ ( error && error.message ) || error }</span> }
			{ result && <MediaItem { ...result } /> }
		</div>
	);
};

export const Update = () => {
	const idInput = useRef< HTMLInputElement >( null );
	const titleInput = useRef< HTMLInputElement >( null );
	const [ update, result, { isPending, error } ] = useInvokablePromise(
		( id: string, title: string ) => client.update( siteId, id, { title } ),
		[ client, siteId ]
	);

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		const id = idInput?.current?.value;
		const title = titleInput?.current?.value;
		if ( id && title ) {
			update( id, title );
		}
	};

	return (
		<div>
			<form onSubmit={ handleSubmit }>
				<input type="text" ref={ idInput } placeholder="ID" />
				<input type="text" ref={ titleInput } placeholder="Title" />
				<button disabled={ isPending }>Update</button>
			</form>
			{ error && <span>{ ( error && error.message ) || error }</span> }
			{ result && <MediaItem { ...result } /> }
		</div>
	);
};

export const Delete = () => {
	const input = useRef< HTMLInputElement >( null );
	const [ del, , { isPending, error } ] = useInvokablePromise(
		( id: string ) => client.delete( siteId, id ),
		[ client, siteId ]
	);

	const handleSubmit = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		const id = input?.current?.value;
		if ( id ) {
			del( id );
		}
	};

	return (
		<div>
			<form onSubmit={ handleSubmit }>
				<input type="text" ref={ input } placeholder="ID" />
				<button disabled={ isPending }>Delete</button>
			</form>
			{ error && <span>{ ( error && error.message ) || error }</span> }
		</div>
	);
};
