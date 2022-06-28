import { useEffect, useMemo, useState } from 'react';
import { FIELD_UUID } from 'calypso/my-sites/email/form/mailboxes/constants';
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

const touchableFields = new Observable< Partial< Record< FormFieldNames, boolean > > >( {
	alternativeEmail: false,
	firstName: false,
	isAdmin: false,
	lastName: false,
	name: false,
	password: false,
	mailbox: false,
} );

export const useFieldsTouched = () => {
	const [ fieldsTouched, setFieldsTouched ] = useState( touchableFields.get() );

	useEffect( () => {
		return touchableFields.subscribe( setFieldsTouched );
	}, [] );

	const setFieldTouched = useMemo( () => {
		const actions: Omit<
			Record< FormFieldNames, ( dirty: boolean ) => void >,
			typeof FIELD_UUID
		> = {
			alternativeEmail: ( dirty: boolean ) =>
				touchableFields.set( { ...fieldsTouched, alternativeEmail: dirty } ),
			domain: ( dirty: boolean ) => touchableFields.set( { ...fieldsTouched, domain: dirty } ),
			firstName: ( dirty: boolean ) =>
				touchableFields.set( { ...fieldsTouched, firstName: dirty } ),
			isAdmin: ( dirty: boolean ) => touchableFields.set( { ...fieldsTouched, isAdmin: dirty } ),
			lastName: ( dirty: boolean ) => touchableFields.set( { ...fieldsTouched, lastName: dirty } ),
			mailbox: ( dirty: boolean ) => touchableFields.set( { ...fieldsTouched, mailbox: dirty } ),
			name: ( dirty: boolean ) => touchableFields.set( { ...fieldsTouched, name: dirty } ),
			password: ( dirty: boolean ) => touchableFields.set( { ...fieldsTouched, password: dirty } ),
		};

		return actions;
	}, [ fieldsTouched ] );

	return {
		state: fieldsTouched,
		setFieldTouched,
	};
};
