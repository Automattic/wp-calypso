import { useEffect, useMemo, useState } from 'react';
import { FormFieldNames } from 'calypso/my-sites/email/form/mailboxes/types';

/**
 * @see https://gist.github.com/SgtPooki/477014cf16436384f10a68268f86255b
 */
type Subscriber< T > = ( value: T ) => void;
class Observable< T > {
	private subscribers = new Set< Subscriber< T > >();

	constructor( private value: T ) {}

	get(): T {
		return this.value;
	}

	set( newValue: T ): void {
		if ( this.value === newValue ) return;
		this.value = newValue;

		this.subscribers.forEach( ( listener ) => listener( this.value ) );
	}

	subscribe( subscriber: Subscriber< T > ): () => void {
		this.subscribers.add( subscriber );

		return () => this.unsubscribe( subscriber ); // will be used inside React.useEffect
	}

	unsubscribe( subscriber: Subscriber< T > ): void {
		this.subscribers.delete( subscriber );
	}
}

const dirtyFields = new Observable< Partial< Record< FormFieldNames, boolean > > >( {
	alternativeEmail: false,
	firstName: false,
	isAdmin: false,
	lastName: false,
	name: false,
	password: false,
	mailbox: false,
} );

export const useFieldsDirty = () => {
	const [ fieldsDirty, setFieldsDirty ] = useState( dirtyFields.get() );

	useEffect( () => {
		return dirtyFields.subscribe( setFieldsDirty );
	}, [] );

	const actions = useMemo( () => {
		return {
			setAlternativeEmailFieldDirty: ( dirty: boolean ) =>
				dirtyFields.set( { ...fieldsDirty, alternativeEmail: dirty } ),
			setDomainFieldDirty: ( dirty: boolean ) =>
				dirtyFields.set( { ...fieldsDirty, domain: dirty } ),
			setFirstNameFieldDirty: ( dirty: boolean ) =>
				dirtyFields.set( { ...fieldsDirty, firstName: dirty } ),
			setIsAdminFieldDirty: ( dirty: boolean ) =>
				dirtyFields.set( { ...fieldsDirty, isAdmin: dirty } ),
			setLastNameFieldDirty: ( dirty: boolean ) =>
				dirtyFields.set( { ...fieldsDirty, lastName: dirty } ),
			setMailboxFieldDirty: ( dirty: boolean ) =>
				dirtyFields.set( { ...fieldsDirty, mailbox: dirty } ),
			setNameFieldDirty: ( dirty: boolean ) => dirtyFields.set( { ...fieldsDirty, name: dirty } ),
			setPasswordFieldDirty: ( dirty: boolean ) =>
				dirtyFields.set( { ...fieldsDirty, password: dirty } ),
		};
	}, [ fieldsDirty ] );

	return {
		state: fieldsDirty,
		actions,
	};
};
