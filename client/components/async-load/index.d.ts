import { Component, ReactNode, ComponentType } from 'react';

declare module 'calypso/components/async-load' {
	interface AsyncLoadProps {
		placeholder?: ReactNode;
		require: string;
		[ key: string ]: unknown;
	}

	export default class AsyncLoad extends Component<
		AsyncLoadProps,
		{ component: ComponentType | null }
	> {}
}
